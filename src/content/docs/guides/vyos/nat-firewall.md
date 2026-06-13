---
title: NAT & Firewall
description: Zone-based firewall, source NAT, destination NAT (port forwarding), and stateful packet inspection on VyOS.
sidebar:
  order: 3
---

# NAT & Firewall

VyOS uses a **zone-based firewall** model — you define zones, assign interfaces to them, then write rules between zones. This scales far better than interface-based rules.

## The Zone Model

```
         ┌──────────┐
 WAN ───▶│  LOCAL   │◀─── (traffic TO the router)
         └──────────┘
              ▲
              │
         ┌────┴─────┐
 LAN ───▶│  LAN      │◀─── (traffic BETWEEN interfaces)
         └──────────┘
```

- **LOCAL** zone: traffic destined to the router itself (SSH, DNS, management)
- **From LAN** zone: traffic from the LAN zone to WAN/LOCAL
- **From WAN** zone: traffic from WAN to LAN/LOCAL

## Firewall: Basic Setup

### Define Zone Structure

```bash
# LAN zone
set zone-policy zone LAN default-action drop
set zone-policy zone LAN interface eth1
set zone-policy zone LAN interface eth1.10   # VLAN 10
set zone-policy zone LAN interface eth1.20   # VLAN 20

# WAN zone
set zone-policy zone WAN default-action drop
set zone-policy zone WAN interface eth0
```

### LAN to WAN (allow outbound)

```bash
# Allow LAN → WAN
set firewall ipv4 name LAN-to-WAN default-action accept
set firewall ipv4 name LAN-to-WAN rule 10 action accept
set firewall ipv4 name LAN-to-WAN rule 10 state established enable
set firewall ipv4 name LAN-to-WAN rule 10 state related enable

# Apply to zone-policy
set zone-policy zone LAN to WAN firewall ipv4 name LAN-to-WAN
```

### LAN to LOCAL (allow management)

```bash
set firewall ipv4 name LAN-to-LOCAL default-action drop
set firewall ipv4 name LAN-to-LOCAL rule 10 action accept
set firewall ipv4 name LAN-to-LOCAL rule 10 state established enable
set firewall ipv4 name LAN-to-LOCAL rule 10 state related enable
set firewall ipv4 name LAN-to-LOCAL rule 20 action accept
set firewall ipv4 name LAN-to-LOCAL rule 20 protocol icmp
set firewall ipv4 name LAN-to-LOCAL rule 30 action accept
set firewall ipv4 name LAN-to-LOCAL rule 30 destination port 22
set firewall ipv4 name LAN-to-LOCAL rule 30 protocol tcp
set firewall ipv4 name LAN-to-LOCAL rule 40 action accept
set firewall ipv4 name LAN-to-LOCAL rule 40 destination port 53
set firewall ipv4 name LAN-to-LOCAL rule 40 protocol udp

set zone-policy zone LAN to LOCAL firewall ipv4 name LAN-to-LOCAL
```

### WAN to LOCAL (protect the router)

```bash
set firewall ipv4 name WAN-to-LOCAL default-action drop
set firewall ipv4 name WAN-to-LOCAL rule 10 action accept
set firewall ipv4 name WAN-to-LOCAL rule 10 state established enable
set firewall ipv4 name WAN-to-LOCAL rule 10 state related enable
set firewall ipv4 name WAN-to-LOCAL rule 20 action drop
set firewall ipv4 name WAN-to-LOCAL rule 20 state invalid enable

# Allow SSH only from a specific IP
set firewall ipv4 name WAN-to-LOCAL rule 30 action accept
set firewall ipv4 name WAN-to-LOCAL rule 30 destination port 22
set firewall ipv4 name WAN-to-LOCAL rule 30 protocol tcp
set firewall ipv4 name WAN-to-LOCAL rule 30 source address 203.0.113.99/32

set zone-policy zone WAN to LOCAL firewall ipv4 name WAN-to-LOCAL
```

### WAN to LAN (block inbound)

```bash
set firewall ipv4 name WAN-to-LAN default-action drop
set firewall ipv4 name WAN-to-LAN rule 10 action accept
set firewall ipv4 name WAN-to-LAN rule 10 state established enable
set firewall ipv4 name WAN-to-LAN rule 10 state related enable

set zone-policy zone WAN to LAN firewall ipv4 name WAN-to-LAN
```

## Source NAT (Masquerade)

For IPv4 with private LAN IPs, NAT traffic out the WAN interface:

```bash
# SNAT — masquerade all LAN traffic
set nat source rule 100 outbound-interface name eth0
set nat source rule 100 source address 192.168.0.0/16
set nat source rule 100 translation address masquerade

# SNAT — specific static IP
set nat source rule 200 outbound-interface name eth0
set nat source rule 200 source address 10.0.10.0/24
set nat source rule 200 translation address 203.0.113.10
```

### Exclude from NAT (hairpin/internal)

```bash
set nat source rule 100 destination address 192.168.0.0/16
set nat source rule 100 translation address masquerade
set nat source rule 100 exclude
```

## Destination NAT (Port Forwarding)

Forward external port to internal host:

```bash
# Port forward 80/443 to internal web server
set nat destination rule 10 description 'Web Server'
set nat destination rule 10 destination port 80,443
set nat destination rule 10 inbound-interface name eth0
set nat destination rule 10 protocol tcp
set nat destination rule 10 translation address 192.168.1.100
set nat destination rule 10 translation port 80

# Port forward a different external port
set nat destination rule 20 description 'SSH to jumpbox'
set nat destination rule 20 destination port 2222
set nat destination rule 20 inbound-interface name eth0
set nat destination rule 20 protocol tcp
set nat destination rule 20 translation address 192.168.1.50
set nat destination rule 20 translation port 22
```

## Firewall Groups

Use address/network/port groups for cleaner rules:

```bash
# Network group
set firewall group network-group TRUSTED_NETS network 192.168.1.0/24
set firewall group network-group TRUSTED_NETS network 10.0.0.0/24

# Address group
set firewall group address-group WEB_SERVERS address 192.168.1.100
set firewall group address-group WEB_SERVERS address 192.168.1.101

# Port group
set firewall group port-group WEB_PORTS port 80
set firewall group port-group WEB_PORTS port 443

# Use in rules
set firewall ipv4 name LAN-to-LOCAL rule 50 action accept
set firewall ipv4 name LAN-to-LOCAL rule 50 source group network-group TRUSTED_NETS
set firewall ipv4 name LAN-to-LOCAL rule 50 destination group port-group WEB_PORTS
set firewall ipv4 name LAN-to-LOCAL rule 50 protocol tcp
```

## Useful knobs

```bash
# Enable state-policy globally
set firewall state-policy established action accept
set firewall state-policy related action accept
set firewall state-policy invalid action drop

# Rate limiting (ICMP flood protection)
set firewall ipv4 name WAN-to-LOCAL rule 15 action accept
set firewall ipv4 name WAN-to-LOCAL rule 15 protocol icmp
set firewall ipv4 name WAN-to-LOCAL rule 15 limit burst 5
set firewall ipv4 name WAN-to-LOCAL rule 15 limit rate 10/minute

# Log drops (careful — noisy on WAN)
set firewall ipv4 name WAN-to-LOCAL rule 999 action drop
set firewall ipv4 name WAN-to-LOCAL rule 999 log enable
```

## Verify

```bash
show firewall name LAN-to-LOCAL statistics
show nat source statistics
show nat destination statistics
show zone-policy zone LAN
show log firewall
```

## Next

[DHCP & DNS →](../dhcp-dns)
