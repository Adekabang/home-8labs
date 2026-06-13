---
title: Routing — Static, BGP, OSPF
description: Static routes, BGP peering, prefix announcement, OSPF for internal routing — all on VyOS.
sidebar:
  order: 6
---

# Routing

Routing = "where do I find this IP?" VyOS supports static routes (manual), BGP (Internet-scale dynamic), and OSPF (internal dynamic).

## Static Routes

Simplest form — manually define next-hop:

```bash
# Route to a specific network
set protocols static route 10.0.0.0/8 next-hop 192.168.1.254

# Route via interface (point-to-point links)
set protocols static route 10.255.254.0/30 interface wg01

# Default route (gateway)
set protocols static route 0.0.0.0/0 next-hop 203.0.113.1

# Static route with metric (lower = preferred)
set protocols static route 10.0.0.0/8 next-hop 192.168.1.254 distance 10

# Blackhole route (drop traffic)
set protocols static route 172.16.0.0/12 blackhole

# IPv6 static routes
set protocols static route6 2001:db8::/32 next-hop 2001:db8:1::1
```

## BGP (Border Gateway Protocol)

BGP is THE Internet routing protocol. Use it for:
- Announcing your own IP space
- Multi-homing (redundant ISPs)
- Dynamic routing between sites
- Anycast

### Basic eBGP with an ISP

You have AS 65001, ISP has AS 65000. Your subnet: 203.0.114.0/24.

```bash
# BGP instance
set protocols bgp system-as 65001
set protocols bgp parameters router-id 203.0.113.10

# Peer with ISP
set protocols bgp neighbor 203.0.113.1 remote-as 65000
set protocols bgp neighbor 203.0.113.1 description 'Upstream ISP'
set protocols bgp neighbor 203.0.113.1 address-family ipv4-unicast

# Announce your prefix
set protocols bgp address-family ipv4-unicast network 203.0.114.0/24
```

### Prefix Filtering

Control what you announce and accept:

```bash
# Prefix list — only accept default route from ISP
set policy prefix-list ACCEPT-DEFAULT rule 10 action permit
set policy prefix-list ACCEPT-DEFAULT rule 10 prefix 0.0.0.0/0

set policy prefix-list ACCEPT-DEFAULT rule 20 action deny
set policy prefix-list ACCEPT-DEFAULT rule 20 prefix 0.0.0.0/0 ge 1

# Apply to neighbor
set protocols bgp neighbor 203.0.113.1 address-family ipv4-unicast \
  prefix-list import ACCEPT-DEFAULT

# Prefix list — only announce your owned space
set policy prefix-list ANNOUNCE-OWN rule 10 action permit
set policy prefix-list ANNOUNCE-OWN rule 10 prefix 203.0.114.0/24

set protocols bgp neighbor 203.0.113.1 address-family ipv4-unicast \
  prefix-list export ANNOUNCE-OWN
```

### Route Maps

Transform routes before announcement:

```bash
# Route map: prepend AS path (deprioritize this path)
set policy route-map PREPEND rule 10 action permit
set policy route-map PREPEND rule 10 set as-path-prepend '65001 65001 65001'

# Apply to neighbor (export)
set protocols bgp neighbor 203.0.113.1 address-family ipv4-unicast \
  route-map export PREPEND

# Route map: set local preference
set policy route-map LOCALPREF rule 10 action permit
set policy route-map LOCALPREF rule 10 set local-preference 200
```

### iBGP (Internal BGP)

For routing within your own AS — requires full mesh or route reflectors:

```bash
# All iBGP peers share same AS
set protocols bgp neighbor 10.255.254.1 remote-as 65001
set protocols bgp neighbor 10.255.254.1 description 'Site-B'
set protocols bgp neighbor 10.255.254.1 address-family ipv4-unicast
set protocols bgp neighbor 10.255.254.1 address-family ipv6-unicast
set protocols bgp neighbor 10.255.254.1 update-source 10.255.255.1

# Route reflector (avoid full mesh)
set protocols bgp neighbor 10.255.254.1 address-family ipv4-unicast \
  route-reflector-client
```

### BGP over WireGuard

Common pattern: iBGP peering over WireGuard tunnel to VPS that announces your prefix:

```bash
# WireGuard tunnel (already set up)
# wg01: 10.255.254.1/30 (you) <-> 10.255.254.2/30 (VPS)

# BGP over the tunnel
set protocols bgp neighbor 10.255.254.2 remote-as 65001
set protocols bgp neighbor 10.255.254.2 description 'VPS BGP peer'
set protocols bgp neighbor 10.255.254.2 address-family ipv4-unicast
set protocols bgp neighbor 10.255.254.2 update-source 10.255.254.1

# Announce your prefix through VPS
set protocols bgp address-family ipv4-unicast network 203.0.114.0/24
```

### Full BGP Announcement Setup

Home lab with your own /24 and VPS (Vultr):

```
[Home Router] ---WireGuard--- [VPS BGP] ---eBGP--- [Vultr]
  AS 65001                        AS 65001       AS 64515
```

**VPS side:**

```bash
# BGP with Vultr (their AS)
set protocols bgp system-as 65001
set protocols bgp neighbor 169.254.169.254 remote-as 64515
set protocols bgp neighbor 169.254.169.254 address-family ipv4-unicast
set protocols bgp neighbor 169.254.169.254 ebgp-multihop 2

# Announce to Vultr
set protocols bgp address-family ipv4-unicast network 203.0.114.0/24

# iBGP to home router via WireGuard
set protocols bgp neighbor 10.255.254.1 remote-as 65001
set protocols bgp neighbor 10.255.254.1 address-family ipv4-unicast
set protocols bgp neighbor 10.255.254.1 update-source 10.255.254.2
set protocols bgp neighbor 10.255.254.1 next-hop-self
```

## OSPF (Internal Dynamic Routing)

For routing within your network — simpler than BGP for internal use:

```bash
# Enable OSPF
set protocols ospf parameters router-id 10.255.255.1

# Advertise connected networks
set protocols ospf area 0 network 192.168.1.0/24
set protocols ospf area 0 network 10.0.0.0/16

# OSPF on point-to-point links
set protocols ospf area 0 network 10.255.254.0/30

# Passive interface (advertise but don't form adjacencies)
set protocols ospf passive-interface eth1

# Redistribute connected routes
set protocols ospf redistribute connected

# Default route injection
set protocols ospf default-information originate always
```

### Multi-Area OSPF

```bash
# Area 0 (backbone)
set protocols ospf area 0 network 10.0.0.0/24

# Area 1 (branch office)
set protocols ospf area 1 network 10.1.0.0/24

# Area 2 (datacenter)
set protocols ospf area 2 network 10.2.0.0/24
```

## Verify & Troubleshoot

```bash
# BGP
show ip bgp summary
show ip bgp neighbors 203.0.113.1
show ip bgp
show ip bgp neighbors 203.0.113.1 advertised-routes
show ip bgp neighbors 203.0.113.1 received-routes

# OSPF
show ip ospf neighbor
show ip ospf database
show ip ospf interface

# General
show ip route
show ip route 8.8.8.8
show ip route bgp
show ip route ospf

# Forwarding table
show ip forwarding
```

## Routing Pitfalls

- **AS path prepend** doesn't work if you have only one ISP — traffic still comes through them.
- **iBGP full mesh** is required without route reflectors — every iBGP router must peer with every other.
- **Next-hop reachability** — BGP only installs routes whose next-hop is in the routing table.
- **ECMP** (equal-cost multi-path) — enable if you have multiple paths: `set protocols bgp parameters bestpath as-path multipath-relax`.

## Next

[High Availability →](./high-availability)
