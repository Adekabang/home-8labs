---
title: Basic Configuration
description: Hostname, interfaces, users, SSH, system settings — the foundation of any VyOS deployment.
sidebar:
  order: 2
---

# Basic Configuration

Every VyOS configuration starts in **configuration mode** — a sandboxed session. No changes take effect until you `commit`.

```
vyos@vyos:~$ configure
vyos@vyos#
```

The `#` means you're in config mode. Changes are **not** live until committed.

## The Commit Model

VyOS uses a **candidate configuration** model:

| Command | What it does |
|---------|-------------|
| `set` | Stage a change |
| `delete` | Remove a config node |
| `show` | View candidate config |
| `compare` | Diff candidate vs running |
| `commit` | Apply candidate to running |
| `save` | Persist to `/config/config.boot` |
| `rollback` | Revert to last saved config |
| `discard` | Discard all uncommitted changes |

```bash
# Safe workflow
configure
set system host-name wrong-name
compare                     # see what changed
discard                     # nope, start over
set system host-name correct-name
commit
save
```

## System Settings

```bash
set system host-name vyos-gw
set system domain-name home.lan
set system time-zone Asia/Jakarta

# NTP
set system ntp server 0.pool.ntp.org
set system ntp server 1.pool.ntp.org

# Login banner
set system login banner pre-login "Authorized use only"

# Syslog
set system syslog host 192.168.1.100 facility all level info
```

## Users & Authentication

```bash
# Create admin user
set system login user admin authentication plaintext-password 'Str0ngP@ss!'
set system login user admin full-name 'Network Admin'

# SSH key authentication (preferred)
set system login user admin authentication public-keys mykey key 'AAAAB3...'
set system login user admin authentication public-keys mykey type ssh-rsa

# Disable default vyos user
delete system login user vyos
```

## Interfaces

### Loopback

```bash
set interfaces loopback lo address 10.255.255.1/32
```

### Ethernet

```bash
# WAN — DHCP
set interfaces ethernet eth0 description WAN
set interfaces ethernet eth0 address dhcp
set interfaces ethernet eth0 dhcp-options default-route
set interfaces ethernet eth0 dhcp-options name-server

# WAN — Static
set interfaces ethernet eth0 description WAN
set interfaces ethernet eth0 address 203.0.113.10/24
set interfaces ethernet eth0 gateway 203.0.113.1

# LAN
set interfaces ethernet eth1 description LAN
set interfaces ethernet eth1 address 192.168.1.1/24
```

### VLAN (802.1Q)

```bash
# Create VLAN 10 on eth1
set interfaces ethernet eth1 vif 10 description 'Guest Network'
set interfaces ethernet eth1 vif 10 address 10.0.10.1/24

# VLAN 20 — Management
set interfaces ethernet eth1 vif 20 description 'Management'
set interfaces ethernet eth1 vif 20 address 10.0.20.1/24
```

### Bonding / LAG

```bash
# LACP bond
set interfaces bonding bond0 description 'Uplink LAG'
set interfaces bonding bond0 member interface eth0
set interfaces bonding bond0 member interface eth1
set interfaces bonding bond0 mode 802.3ad
set interfaces bonding bond0 address 192.168.1.1/24
```

### Bridge

```bash
set interfaces bridge br0 description 'LAN Bridge'
set interfaces bridge br0 member interface eth1
set interfaces bridge br0 member interface eth2
set interfaces bridge br0 address 192.168.1.1/24
```

## SSH Access

```bash
# Basic SSH
set service ssh port 22
set service ssh listen-address 192.168.1.1

# Restrict to specific users/groups
set service ssh disable-password-authentication
set service ssh access-control allow-users admin operator

# Enable on specific interfaces only
set service ssh listen-address 192.168.1.1
```

## DNS

```bash
# System DNS (for the router itself)
set system name-server 1.1.1.1
set system name-server 8.8.8.8

# DNS forwarding for LAN clients (covered in dhcp-dns guide)
```

## IPv6 Basics

```bash
# Enable IPv6 globally
set system ipv6 disable-forwarding false

# SLAAC + DHCPv6 on WAN
set interfaces ethernet eth0 address dhcpv6

# Static IPv6 on LAN
set interfaces ethernet eth1 address 2001:db8:1::1/64
```

## Verify & Troubleshoot

```bash
# Operational mode (exit config first)
show interfaces
show interfaces ethernet eth0
show ip route
show ipv6 route
show system uptime
show version

# Ping/traceroute from router
ping 8.8.8.8
traceroute 8.8.8.8

# Monitor interfaces
monitor interfaces ethernet eth0
```

## Configuring Remotely? READ THIS

Use `commit-confirm` instead of `commit` when working remotely. The router auto-rolls back if you lose connectivity:

```bash
commit-confirm 5   # auto-rollback in 5 minutes
# verify connectivity
# if good:
confirm             # make it permanent
```

This has saved more network engineers than any other single command.

## Next

[NAT & Firewall →](../nat-firewall)
