---
title: "OPNsense Performance Tuning for Multi-Gigabit Internet: The Complete Guide"
description: "Why OPNsense struggles with multi-gigabit connections and how to fix it, tested on Proxmox with community-validated tunables and 2026 updates."
date: 2026-07-22
sidebar:
  order: 0
---

Out of the box, OPNsense caps out at around 2-3 Gbps throughput even on powerful hardware. If you have a multi-gigabit connection, you know the frustration: your ISP provisioned 6 Gbps, your server has Xeon processors and 64 GB of RAM, yet OPNsense barely uses a quarter of your line rate. Worse, a Debian VM on the same Proxmox host easily hits 9.6 Gbps without any tuning.

This guide synthesizes two of the most referenced resources on this topic , [Kirk Schnable's 2022 deep dive](https://binaryimpulse.com/2022/11/opnsense-performance-tuning-for-multi-gigabit-internet/) on Binary Impulse and [Truvis Thornton's 2024 tunable-focused guide](https://medium.com/@truvis.thornton/opnsense-firewall-configuration-performance-tuning-for-multi-gigabit-internet-and-better-speeds-in-cfc80c49c544) on Medium , plus real community reports spanning 2022 through 2026. Everything below is battle-tested by people who ran into the same wall you're hitting.

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

Debian on the same hardware was 4× faster. This immediately rules out the hypervisor, NIC, and switch , the bottleneck is purely FreeBSD's network stack inside OPNsense.

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
All tunables require a reboot to take effect. Test one group at a time.
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
| `net.isr.dispatch = deferred` | Changes packet dispatch policy. Without this, the two tunables above do nothing meaningful. |
| `hw.ibrs_disable = 1` | Disables Spectre V2 mitigation (Indirect Branch Restricted Speculation), which imposes significant overhead on packet processing. |
| `vm.pmap.pti = 0` | Disables Kernel Page Table Isolation (Meltdown mitigation). Like IBRS, PTI adds per-syscall overhead that hurts network throughput. Only disable if this is a dedicated firewall VM, not a shared host. |

### Group 2: Receive Side Scaling (RSS)

RSS distributes packet flows across CPU cores using hardware hashing of the TCP 4-tuple (src IP, src port, dst IP, dst port). This keeps flows pinned to the same core and prevents cache-line ping-pong.

```
net.inet.rss.enabled = 1
net.inet.rss.bits = N
```

For `net.inet.rss.bits`, set it based on your core count:

| CPU Cores | rss.bits Value |
|-----------|---------------|
| 4 | 2 |
| 8 | 3 |
| 16 | 4 |
| 24 | 6 |

The formula: `rss.bits = CPU_cores / 4`. Verify with `netstat -Q` after reboot.

:::caution
RSS requires NIC driver support. Confirmed working: `igb`, `axgbe`, `ixgbe`, `ixl`, `cxgbe`, `lio`, `mlx5`, `sfxge`. If your NIC doesn't support RSS, packets get interrupted on CPU 0 only , keep `net.inet.rss.enabled = 0`.
:::

### Group 3: Socket Buffers & TCP

Taken from the [Calomel FreeBSD Network Tuning Guide](https://calomel.org/freebsd_network_tuning.html), these increase kernel socket buffers beyond their conservative defaults:

```
kern.ipc.maxsockbuf = 614400000
net.inet.tcp.recvbuf_max = 4194304
net.inet.tcp.recvspace = 65536
net.inet.tcp.sendbuf_inc = 65536
net.inet.tcp.sendbuf_max = 4194304
net.inet.tcp.sendspace = 65536
net.inet.tcp.soreceive_stream = 1
```

| Tunable | Notes |
|---------|-------|
| `kern.ipc.maxsockbuf` | 614400000 is the Calomel recommendation for 100 Gbps cards. For 10 Gbps, `16777216` is sufficient and less wasteful. |
| `soreceive_stream = 1` | Enables the optimized kernel socket interface for TCP streams. Significantly reduces CPU usage and lock contention on fast TCP flows. |

### Group 4: Firewall Hash Table

```
net.pf.source_nodes_hashsize = 1048576
```

The default PF source nodes hash table is 32,768 entries. As tracked connections approach 100K, the hash table becomes a bottleneck causing packet drops. Increasing to 1M entries sustains throughput even with millions of tracked connections.

### Group 5: MSS Clamping & TCP Tuning

```
net.inet.tcp.mssdflt = 1240
net.inet.tcp.abc_l_var = 52
net.inet.tcp.initcwnd_segments = 52
net.inet.tcp.minmss = 536
```

**Important warning from the comments:** Setting `mssdflt = 1240` effectively clamps the Maximum Segment Size. On standard Ethernet (MTU 1500), the correct value is `1460` (1500 − 20 byte IPv4 header). A value of 1240 may cause fragmentation and introduce latency, especially for gaming. Consider leaving this at default unless you have a specific reason (e.g., PPPoE with 1492 MTU minus overhead).

:::tip
One commenter also recommends disabling **Interface Scrub** under **Firewall > Settings > Normalization**. PF with an outgoing scrub rule re-packages packets at MTU 1460 by default, overriding your `mssdflt` setting and wasting CPU cycles.
:::

### Group 6: Entropy & Queues

```
kern.random.fortuna.minpoolsize = 128
net.isr.defaultqlimit = 2048
```

`fortuna.minpoolsize` improves RNG entropy pool size , relevant if you run VPN services. `defaultqlimit` increases the per-workstream queue depth, preventing drops under bursty traffic.

## Community Wisdom: What Actually Works

The Binary Impulse post accumulated 30 comments over 4 years. Here is what the community learned through trial, error, and frustration:

### The Virtualization Ceiling

> "I manage just under 4.5 Gbps between any FreeBSD host and any other VM on the same vSwitch, a far cry from 33 Gbps I manage between Linux VMs. There is something fundamentally wrong with BSD and/or the vtnet drivers." , **2026 commenter, FreeBSD 15**

If you need >5 Gbps through a virtualized BSD router, the host OS matters more than any tunable. Several community members eventually gave up and switched to Debian-based routing VMs.

### Jumbo Frames: The One-Toggle Fix

> "I changed the MTU on my LAN and WAN interface from 1500 to 9000. And like magic, it worked! 3.2 Gbps to 9.9 Gbps." , **Community commenter**

If your entire network path supports jumbo frames (switches, clients, ISP hand-off), setting **MTU 9000** on all OPNsense interfaces can be the single most impactful change. This reduces packet processing overhead dramatically. Test with iperf first.

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
| **RSS support** | Now mainstream in OPNsense since 21.7, more drivers supported |

The gap has narrowed but not closed. For sub-5 Gbps connections on bare metal or with the latest OPNsense 25.x+, the tunables in this guide will get you to line rate. For 10 Gbps+ virtualized routing, Debian or a dedicated Linux-based router distribution may still be the pragmatic choice.

## Complete Tunable Reference

Copy-paste ready list for **System > Settings > Tunables**:

```
# CPU & Interrupt Processing
net.isr.maxthreads = -1
net.isr.bindthreads = 1
net.isr.dispatch = deferred
hw.ibrs_disable = 1
vm.pmap.pti = 0

# Receive Side Scaling
net.inet.rss.enabled = 1
net.inet.rss.bits = 6

# Socket Buffers & TCP (10 Gbps)
kern.ipc.maxsockbuf = 16777216
net.inet.tcp.recvbuf_max = 4194304
net.inet.tcp.recvspace = 65536
net.inet.tcp.sendbuf_inc = 65536
net.inet.tcp.sendbuf_max = 4194304
net.inet.tcp.sendspace = 65536
net.inet.tcp.soreceive_stream = 1

# PF Hash Table
net.pf.source_nodes_hashsize = 1048576

# MSS & Queues
net.inet.tcp.minmss = 536
net.isr.defaultqlimit = 2048

# Entropy (for VPN)
kern.random.fortuna.minpoolsize = 128
```

## Verification

After applying tunables and rebooting:

```bash
# Check netisr thread distribution
netstat -Q

# Check RSS binding
sysctl net.inet.rss.enabled

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
- [OPNsense Forum , Enabling Receive Side Scaling](https://forum.opnsense.org/index.php?topic=24409.0)
- Community comments on the Binary Impulse post (2022–2026)
