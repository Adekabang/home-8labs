---
title: "OPNsense Performance Tuning for Multi-Gigabit Internet: The Complete Guide"
description: "Why OPNsense struggles with multi-gigabit connections and how to fix it, tested on Proxmox with community-validated tunables and 2026 updates."
date: 2026-07-22
sidebar:
  order: 0
---

Out of the box, OPNsense caps out at around 2-3 Gbps throughput even on powerful hardware. If you have a multi-gigabit connection, you know the frustration: your ISP provisioned 6 Gbps, your server has Xeon processors and 64 GB of RAM, yet OPNsense barely uses a quarter of your line rate. Worse, a Debian VM on the same Proxmox host easily hits 9.6 Gbps without any tuning.

This guide synthesizes two of the most referenced resources on this topic , [Kirk Schnable's 2022 deep dive](https://binaryimpulse.com/2022/11/opnsense-performance-tuning-for-multi-gigabit-internet/) on Binary Impulse and [Truvis Thornton's 2024 tunable-focused guide](https://medium.com/@truvis.thornton/opnsense-firewall-configuration-performance-tuning-for-multi-gigabit-internet-and-better-speeds-in-cfc80c49c544) on Medium , cross-checked against the [official OPNsense performance documentation](https://docs.opnsense.org/troubleshooting/performance.html) and the FreeBSD `pf(4)` man page, plus real community reports spanning 2022 through 2026.

## The Setup: Proxmox + OPNsense

Kirk's baseline setup (2022):

| Component | Spec |
|-----------|------|
| **CPU** | Intel Xeon E5-2650L v3 (12C/24T) |
| **RAM** | 64 GB DDR4 |
| **NIC** | Intel X520-DA2 (10 Gbps SFP+) |
| **Hypervisor** | Proxmox VE |
| **OPNsense VM** | KVM64 CPU type, VirtIO NICs |
| **Connection** | 6 Gbps WAN (7 Gbps aggregate, dual hand-off) |

### Baseline Performance (Untuned)

| VM | NIC Type | Throughput |
|----|----------|------------|
| Debian 11 | VirtIO | 9.6 Gbps ✅ |
| OPNsense (default) | VirtIO | 2–3 Gbps ❌ |
| OPNsense | E1000 | <1 Gbps |
| OPNsense | RTL8139 | <1 Gbps |
| OPNsense | vmxnet3 | <1 Gbps |

Debian on the same hardware was 4× faster. This rules out the physical NIC, switch, and host hardware. The bottleneck is in the guest's network stack — specifically the interaction between FreeBSD's kernel and the VirtIO (vtnet) driver, a theme that recurs throughout community reports from 2022 through 2026.

## Proxmox VM Configuration

### Machine Type & Multiqueue

Use the default **i440fx** machine type (q35 offers no measurable benefit here). In the Proxmox NIC settings, two critical tweaks beyond choosing VirtIO:

| Setting | Value | Why |
|---------|-------|-----|
| **Firewall** | Disabled | Proxmox's firewall adds a second layer of packet processing, doubling overhead. Let OPNsense handle it. |
| **Multiqueue** | 8 (or match vCPU count) | Enables parallel packet processing across multiple vCPU queues. This works hand-in-hand with RSS and netisr thread distribution. Start with 8, or match your vCPU count. |

Optionally enable **NUMA** in the VM CPU settings (Emin from xeome.dev reports no measurable performance boost, but it doesn't hurt).

### VirtIO: Still the Best Option

Despite FreeBSD's rocky history with VirtIO drivers (major issues in FreeBSD 11/12, partially fixed in 13), VirtIO remains the best performing virtual NIC type for OPNsense out of the box. Every alternative tested worse.

**2026 update:** A community member reports that as of OPNsense 25.7.8, the VirtIO net driver has been overhauled with significantly improved hardware offloading. However, FreeBSD 15 still shows vtnet/virtio limitations , maxing out around 4.5 Gbps between FreeBSD VMs on the same vSwitch, compared to 33 Gbps between Linux VMs. If you're virtualizing at 10 Gbps+, BSD-based routing may still be a fundamental bottleneck.

### CPU Type: KVM64 Beats Host

Counter-intuitively, the `KVM64` CPU type performed better than `host` in Kirk's testing. If you're running VPN workloads, add the `AES` flag:

```
CPU type: kvm64
Flags: +aes
```

### NUMA & Sockets

One commenter flagged an important Proxmox gotcha: if you set 4 sockets in the VM config but only have 1 physical CPU, you're creating unnecessary NUMA overhead. Use:

- **Sockets:** 1
- **Cores:** match your actual physical core count (or slightly less)
- **NUMA:** disabled (unless you genuinely have multiple physical sockets)

## Hardware Offloading: Turn It All Off

This is the most counter-intuitive finding across both guides. On a *firewall*, hardware offloading features that help servers actually hurt you.

| Offload Setting | Effect |
|----------------|--------|
| **Hardware TSO** | No benefit, sometimes degrades WAN |
| **Hardware LRO** | Boosts LAN speed but nukes WAN to <1 Mbps |
| **Hardware VLAN Filtering** | Breaks the web UI entirely , had to edit `/conf/config.xml` from console to recover |

The pattern: enabling hardware offload on LAN interfaces would spike LAN iperf to 8 Gbps while simultaneously collapsing WAN throughput to under 1 Mbps. The offload engines appear to starve the WAN interface of processing time.

**Final recommendation:** disable all three hardware offloading options under **Interfaces > Settings**. Kirk achieved full 6 Gbps line rate with all offloading disabled. Truvis came to the same conclusion.

## Sysctl Tunables: The Real Fix

Both guides converge on the same root cause: FreeBSD's conservative default `sysctl` values are tuned for 1 Gbps era hardware. The fix is a set of tunables applied under **System > Settings > Tunables**.

:::note
Most tunables here take effect immediately via `sysctl`, but several critical ones are *loader* tunables that only apply at boot: **net.inet.rss.enabled**, **net.inet.rss.bits**, **vm.pmap.pti**, **net.isr.maxthreads**, **net.isr.bindthreads**, **net.pf.states_hashsize**, and **net.pf.source_nodes_hashsize**. Apply them via **System > Settings > Tunables**, then reboot. Test one group at a time.
:::

### Group 1: CPU & Interrupt Processing

These unshackle FreeBSD's network stack from single-threaded processing:

```
net.isr.maxthreads = -1
net.isr.bindthreads = 1
net.isr.dispatch = deferred
hw.ibrs_disable = 1
vm.pmap.pti = 0
```

| Tunable | What It Does |
|---------|-------------|
| `net.isr.maxthreads = -1` | Spawns one netisr thread per CPU core instead of the default single-threaded processing. This is the single most impactful tunable for multi-gigabit throughput. |
| `net.isr.bindthreads = 1` | Pins each netisr thread to its own core, reducing cache misses and lock contention. |
| `net.isr.dispatch = deferred` | Changes packet dispatch policy so packets are queued to netisr threads instead of being processed in the interrupt context. This is what the community guides (Kirk, Truvis, xeome) recommend. **However**, note that per the official OPNsense docs, enabling RSS (Group 2) automatically moves the dispatch policy from `direct` to `hybrid` — the docs' recommended RSS tunable set does *not* include forcing `deferred`. If you enable RSS, consider leaving `net.isr.dispatch` at its default and letting RSS switch it to hybrid; test both and compare with `netstat -Q`. |
| `hw.ibrs_disable = 1` | Disables Spectre V2 mitigation (Indirect Branch Restricted Speculation). Both this and `vm.pmap.pti` disable CPU-level security mitigations; only do this on a dedicated firewall appliance where the performance gain outweighs the risk. |
| `vm.pmap.pti = 0` | Disables Kernel Page Table Isolation (Meltdown mitigation). Like IBRS, PTI adds per-syscall overhead that hurts network throughput. Only disable if this is a dedicated firewall VM, not a shared host. |

### Group 2: Receive Side Scaling (RSS)

RSS distributes packet flows across CPU cores using a hash of the TCP 4-tuple (src IP, src port, dst IP, dst port) — computed in hardware when the NIC supports it, or in software. This keeps flows pinned to the same core and prevents cache-line ping-pong. Note that RSS is **disabled by default in OPNsense on purpose** because its impact is far-reaching; the official docs frame it as something to test under high load, not a guaranteed win.

```
net.inet.rss.enabled = 1
net.inet.rss.bits = N
```

`net.inet.rss.bits` is the number of **binary bits** for the RSS bucket table — it produces `2^N` buckets, not `N` buckets. Per the official OPNsense documentation: the *default* is already the number of bits representing your core count × 2 (intended for future load-balancing that is not yet implemented), and the **official recommendation is to set it lower — to the number of bits representing your CPU core count**:

| vCPUs | rss.bits (official recommendation) | Buckets (2^N) |
|-------|-----------------------------------|---------------|
| 2 | 1 | 2 |
| 4 | 2 | 4 |
| 8 | 3 | 8 |
| 12 | 4 | 16 |
| 16 | 4 | 16 |
| 24 | 5 | 32 |

The formula: `rss.bits = ceil(log2(vCPUs))`. If you leave `rss.bits` unset, the kernel default (cores × 2 in bucket count) still works — it just allocates more buckets than the docs recommend.

:::caution
**RSS requires driver-level support.** The official docs list drivers that support RSS according to source code: `em`, `igb` (tested & working), `axgbe` (tested & working), `netvsc`, `ixgbe`, `ixl`, `cxgbe`, `lio`, `mlx5`, `sfxge`. **VirtIO (`vtnet`) is not on this list** — which matters, because the setup this guide is based on uses VirtIO NICs. The docs give no guarantee that any given driver will properly handle the kernel RSS implementation.

To check whether your driver exposes RSS, run `sysctl -a | grep rss` (drivers that support toggling it will expose a tunable) and `dmesg | grep vectors` (multiple MSI-X vectors indicate multiple hardware queues). NICs with no RSS and no other queue filter will most likely interrupt only CPU 0 at all times — in that case, keep `net.inet.rss.enabled = 0` and rely on the `net.isr` tunables for multi-core distribution.
:::

### Group 3: Socket Buffers & TCP

Taken from the [Calomel FreeBSD Network Tuning Guide](https://calomel.org/freebsd_network_tuning.html), these increase kernel socket buffers beyond their conservative defaults:

```
kern.ipc.maxsockbuf = 16777216
net.inet.tcp.recvbuf_max = 4194304
net.inet.tcp.recvspace = 65536
net.inet.tcp.sendbuf_inc = 65536
net.inet.tcp.sendbuf_max = 4194304
net.inet.tcp.sendspace = 65536
net.inet.tcp.soreceive_stream = 1
```

| Tunable | Notes |
|---------|-------|
| `kern.ipc.maxsockbuf` | `16777216` is appropriate for 10 Gbps. Calomel's `614400000` figure is their recommendation for 100 Gbps cards — overkill here. |
| `soreceive_stream = 1` | Enables the optimized kernel socket interface for TCP streams. |

:::caution
**These tunables only affect TCP connections that terminate *on the firewall itself*.** This includes the web UI, SSH, VPN tunnels (OpenVPN/WireGuard), reverse proxies, and iperf3 when run from the firewall. Routed/NAT traffic between WAN and LAN does **not** pass through the firewall's TCP socket buffers — it is forwarded at the IP layer by pf. These tunables will not improve your multi-gigabit WAN-to-LAN throughput through NAT, and this is why many users copy them without measurable effect.
:::

### Group 4: PF Hash Tables

```
net.pf.states_hashsize = 1048576
```

PF maintains two separate hash tables, and it is important not to confuse them (the original guides only mentioned `source_nodes_hashsize`, which led many users to tune the wrong one):

| Tunable | Default (per `pf(4)`) | Purpose |
|---------|----------------------|---------|
| `net.pf.states_hashsize` | 131072 | Hash table for the **state table** — every tracked connection. This is the one that matters for throughput. Under high connection counts, a small hash table causes collisions and lock contention (states are locked per hash row; one or two states per row is ideal). |
| `net.pf.source_nodes_hashsize` | 32768 | Hash table for **source tracking** only: `sticky-address`, `max-src-conn`, `max-src-states`, source-based rate limiting. If you have no source tracking rules, increasing it does nothing useful. |

Both must be powers of 2 and are loader tunables (reboot required). Size `states_hashsize` relative to your expected state count — roughly one to two states per hash row is ideal, so 1M rows comfortably covers state tables in the high hundreds of thousands.

:::note
**RAM cost:** benchmarks measuring pf's hash allocation put it at roughly 80 bytes per hash row, so `states_hashsize = 1048576` reserves on the order of 80 MB of kernel RAM. Fine on a box with 8 GB+; think twice on small appliances.
:::

### Group 5: TCP Default MSS & Initcwnd

Older versions of the community guides recommend these; we list them for reference but **do not recommend setting them** on a pure firewall:

```
# Reference only — affects firewall-local TCP connections, not forwarded traffic
# net.inet.tcp.mssdflt = 1240
# net.inet.tcp.abc_l_var = 52
# net.inet.tcp.initcwnd_segments = 52
# net.inet.tcp.minmss = 536
```

**What `mssdflt` actually does:** This sets the *default* MSS that the firewall's own TCP stack uses when a peer does not send an MSS option during the TCP handshake. It is **not** MSS clamping for forwarded traffic. MSS clamping (limiting the MSS of connections passing *through* the firewall) is configured in the **MSS** field on each interface in OPNsense, which generates a `scrub max-mss` rule in pf. These are different mechanisms.

:::note
**MSS arithmetic:** For standard Ethernet with 1500-byte MTU, the correct MSS is **1460** = 1500 − 20 (IPv4 header) − 20 (TCP header). Setting `mssdflt` lower than this (like 1240 or 1448) does not cause fragmentation — smaller MSS actually reduces fragmentation risk — but it increases overhead (more header bytes per payload byte), which reduces effective throughput.
:::

The related `abc_l_var` and `initcwnd_segments` tunables control TCP congestion window behavior for connections terminating on the firewall. Like the socket buffer tunables in Group 3, they do not affect forwarded traffic.

:::tip
One commenter reports lower CPU usage after disabling **Interface Scrub** under **Firewall > Settings > Normalization**. pf's scrub performs packet normalization (including fragment reassembly), which costs CPU cycles on every packet; if you don't need normalization, disabling it removes that per-packet work. Treat this as a community anecdote — test before and after.
:::

### Group 6: Entropy & Queues

```
kern.random.fortuna.minpoolsize = 128
net.isr.defaultqlimit = 2048
```

`fortuna.minpoolsize` raises the minimum entropy pool size threshold used by the Fortuna RNG before (re)seeding — potentially relevant if you run VPN services that consume a lot of randomness. `defaultqlimit` increases the per-workstream netisr queue depth, preventing drops under bursty traffic.

## Community Wisdom: What Actually Works

The Binary Impulse post accumulated 30 comments over 4 years. Here is what the community learned through trial, error, and frustration:

### The Virtualization Ceiling

> "I manage just under 4.5 Gbps between any FreeBSD host and any other VM on the same vSwitch, a far cry from 33 Gbps I manage between Linux VMs. There is something fundamentally wrong with BSD and/or the vtnet drivers." , **2026 commenter, FreeBSD 15**

If you need >5 Gbps through a virtualized BSD router, the host OS matters more than any tunable. Several community members eventually gave up and switched to Debian-based routing VMs.

### Jumbo Frames: LAN-Only Silver Bullet

> "I changed the MTU on my LAN and WAN interface from 1500 to 9000. And like magic, it worked! 3.2 Gbps to 9.9 Gbps." , **Community commenter**

Setting **MTU 9000** on LAN interfaces can dramatically improve LAN throughput by reducing per-packet processing overhead. The 3.2 → 9.9 Gbps result is almost certainly an internal iperf test between LAN hosts, not WAN throughput.

**For WAN:** your ISP hand-off almost certainly uses MTU 1500. Setting MTU 9000 on the WAN interface is risky — if every hop between you and your ISP does not support jumbo frames, you will hit Path MTU Discovery black holes (packets silently dropped with no ICMP feedback). Unless your ISP explicitly documents jumbo frame support on their hand-off, leave WAN MTU at 1500.

### The Author Gave Up

Kirk himself upgraded to 10 Gbps after writing the guide and found OPNsense couldn't keep up:

> "I ended up abandoning the BSD based router distributions and went back to running a router on a Debian based system, which I was able to virtualize in Proxmox and maintain 10 Gbps easily. FreeBSD's drivers must just be behind the times for these multi-gigabit use cases."

### i225 NICs Still Problematic

Multiple users with Intel i225 (2.5 Gbps) NICs on bare metal report unstable throughput , speeds spike to 2.34 Gbps then collapse to 600 Mbps. This appears to be a lingering FreeBSD driver issue, not a tunable problem.

## 2026 Update: What Changed

| Change | Status |
|--------|--------|
| **OPNsense 25.7.8 VirtIO overhaul** | Hardware offloading vastly improved per community reports |
| **FreeBSD 15 vtnet** | Still capped at ~4.5 Gbps VM-to-VM |
| **Linux VM routing** | Still 7-8× faster than BSD on same vSwitch |
| **RSS support** | Available since ~21.7, but still disabled by default and officially framed as experimental — enable and test, don't assume |

The gap has narrowed but not closed. For sub-5 Gbps connections on bare metal or with the latest OPNsense 25.x+, the tunables in this guide will get you to line rate. For 10 Gbps+ virtualized routing, Debian or a dedicated Linux-based router distribution may still be the pragmatic choice.

## Complete Tunable Reference

Copy-paste ready list for **System > Settings > Tunables**:

```
# CPU & Interrupt Processing
net.isr.maxthreads = -1
net.isr.bindthreads = 1
hw.ibrs_disable = 1
vm.pmap.pti = 0

# Dispatch policy: community guides use 'deferred'. If enabling RSS below,
# consider leaving this unset — RSS moves the policy to 'hybrid' automatically.
# net.isr.dispatch = deferred

# Receive Side Scaling — check driver support first (see Group 2)
net.inet.rss.enabled = 1
# net.inet.rss.bits = 3   # ← ceil(log2(vCPUs)): 4 cores→2, 8→3, 16→4, 24→5

# Socket Buffers & TCP (10 Gbps — only affects firewall-local connections)
kern.ipc.maxsockbuf = 16777216
net.inet.tcp.recvbuf_max = 4194304
net.inet.tcp.recvspace = 65536
net.inet.tcp.sendbuf_inc = 65536
net.inet.tcp.sendbuf_max = 4194304
net.inet.tcp.sendspace = 65536
net.inet.tcp.soreceive_stream = 1

# PF Hash Tables (defaults: states 131072, source_nodes 32768)
net.pf.states_hashsize = 1048576              # the one that matters (~80 MB RAM)
# net.pf.source_nodes_hashsize = 1048576      # only with source tracking rules

# Queues
net.isr.defaultqlimit = 2048

# Entropy (for VPN)
kern.random.fortuna.minpoolsize = 128
```

## Verification

After applying tunables and rebooting:

```bash
# Verify netisr thread distribution and dispatch policy.
# With RSS enabled, the policy should read 'hybrid' (per official docs).
netstat -Q

# Inspect RSS configuration (bits, buckets, key)
sysctl net.inet.rss

# Check whether your NIC driver exposes RSS and uses multiple queues
sysctl -a | grep rss
dmesg | grep vectors

# Test LAN throughput
iperf3 -c <lan-client-ip>

# Test WAN throughput (from client behind OPNsense)
speedtest-cli
```

## Sources

- [Kirk Schnable , OPNsense Performance Tuning for Multi-Gigabit Internet](https://binaryimpulse.com/2022/11/opnsense-performance-tuning-for-multi-gigabit-internet/) (2022)
- [Truvis Thornton , OPNsense Firewall Configuration: Performance Tuning](https://medium.com/@truvis.thornton/opnsense-firewall-configuration-performance-tuning-for-multi-gigabit-internet-and-better-speeds-in-cfc80c49c544) (2024)
- [Emin's Notes — OPNsense Performance Tuning Guide on Proxmox](https://notes.xeome.dev/notes/OPNSense-Tuning) (2023)
- [Calomel — FreeBSD Network Performance Tuning](https://calomel.org/freebsd_network_tuning.html)
- [OPNsense Documentation — Performance / Receive-side scaling](https://docs.opnsense.org/troubleshooting/performance.html)
- [FreeBSD `pf(4)` man page — hash table defaults](https://man.freebsd.org/cgi/man.cgi?query=pf&sektion=4)
- [Olivier Cochard — Playing with FreeBSD packet filter state table limits](https://blog.cochard.me/2016/05/playing-with-freebsd-packet-filter.html) (pf hash RAM measurements)
- [OPNsense Forum , Enabling Receive Side Scaling](https://forum.opnsense.org/index.php?topic=24409.0)
- Community comments on the Binary Impulse post (2022–2026)
