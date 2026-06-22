---
title: VyOS Open-Source Network Router Crash Course
description: Complete guide to VyOS, the open-source network OS, from installation through BGP, WireGuard, firewalls, and availability.
sidebar:
  order: 0
---

# VyOS Crash Course

**VyOS** is an open-source network operating system based on Debian. It provides a unified CLI for routing, firewall, VPN, NAT, and more — similar to Juniper JunOS or Cisco IOS but running on standard x86 hardware or VMs.

If you've ever used EdgeOS (Ubiquiti EdgeRouter), you already know VyOS — EdgeOS is a fork. VyOS is the upstream, community-maintained original.

## Why VyOS?

| vs. | VyOS wins because |
|-----|-------------------|
| **pfSense/OPNsense** | CLI-first, declarative config, `commit`/`rollback`, API-ready |
| **MikroTik RouterOS** | Linux under the hood, standard tooling, no license tiers |
| **Cisco/Juniper** | Free, runs on any x86, same routing concepts |
| **iptables/nftables** | Unified config syntax, zone-based firewall, stateful commit |

## What you'll learn

1. **[Installation](./installation)** — ISO, cloud images, VPS deployment
2. **[Basic Configuration](./basic-configuration)** — hostname, users, interfaces, SSH
3. **[NAT & Firewall](./nat-firewall)** — zone-based firewall, source NAT, port forwarding
4. **[DHCP & DNS](./dhcp-dns)** — DHCP server, DNS forwarding, dynamic DNS
5. **[VPN](./vpn)** — WireGuard, IPsec IKEv2, site-to-site and road warrior
6. **[Routing](./routing)** — static routes, BGP, OSPF
7. **[High Availability](./high-availability)** — VRRP, config sync, stateful failover
8. **[Configuration Backup with Git](./configuration-backup)** — auto-backup config on every commit
9. **[Image Automation](./image-automation)** — custom ISO builds, cron pipelines, CI/CD
10. **[Syslog to Graylog](./syslog-graylog)** — centralized logging, Grok extractors, dashboards

## Release tracks

| Channel | Version | Status | Access |
|---------|---------|--------|--------|
| **Rolling** | 1.5 Circinus | Active development | Free |
| **Stream** | 1.5 (quarterly) | LTS preview, stable | Free |
| **LTS** | 1.4 Sagitta | Current LTS | Contributor/paid |
| **LTS (old)** | 1.3 Equuleus | Maintenance only | Contributor/paid |

This guide targets **VyOS 1.4/1.5** — the configuration syntax changed significantly in 1.4. If you're on 1.3 (Equuleus), some commands will differ. It's still maintained for security fixes but no new features — new deployments should start on 1.4 or 1.5. Check the [official migration guide](https://docs.vyos.io/en/latest/installation/migrate-from-1-3.html).

## Quick reference

```
# Enter configuration mode
configure

# Set hostname
set system host-name vyos-router

# Commit and save
commit
save

# Exit configuration mode
exit

# Show current config
show configuration

# Show version
show version
```
