---
title: DHCP & DNS
description: DHCP server configuration, static leases, DNS forwarding, dynamic DNS updates — all on VyOS.
sidebar:
  order: 4
---

# DHCP & DNS

## DHCP Server

VyOS can serve DHCP on any interface. Standard home-router setup takes ~10 lines.

### Basic DHCP Pool

```bash
# Enable DHCP on LAN interface
set service dhcp-server shared-network-name LAN subnet 192.168.1.0/24 range 0 start 192.168.1.100
set service dhcp-server shared-network-name LAN subnet 192.168.1.0/24 range 0 stop 192.168.1.200

# Default gateway
set service dhcp-server shared-network-name LAN subnet 192.168.1.0/24 default-router 192.168.1.1

# DNS servers
set service dhcp-server shared-network-name LAN subnet 192.168.1.0/24 name-server 1.1.1.1
set service dhcp-server shared-network-name LAN subnet 192.168.1.0/24 name-server 8.8.8.8

# Lease time (default 86400 = 24h)
set service dhcp-server shared-network-name LAN subnet 192.168.1.0/24 lease 86400
```

### Static Mappings

Reserve IPs for specific MAC addresses:

```bash
set service dhcp-server shared-network-name LAN subnet 192.168.1.0/24 \
  static-mapping printer ip-address 192.168.1.10
set service dhcp-server shared-network-name LAN subnet 192.168.1.0/24 \
  static-mapping printer mac-address aa:bb:cc:dd:ee:ff

set service dhcp-server shared-network-name LAN subnet 192.168.1.0/24 \
  static-mapping nas ip-address 192.168.1.20
set service dhcp-server shared-network-name LAN subnet 192.168.1.0/24 \
  static-mapping nas mac-address 11:22:33:44:55:66
```

### Multiple Subnets / VLANs

```bash
# VLAN 10 — Guest network
set service dhcp-server shared-network-name GUEST subnet 10.0.10.0/24 range 0 start 10.0.10.100
set service dhcp-server shared-network-name GUEST subnet 10.0.10.0/24 range 0 stop 10.0.10.200
set service dhcp-server shared-network-name GUEST subnet 10.0.10.0/24 default-router 10.0.10.1
set service dhcp-server shared-network-name GUEST subnet 10.0.10.0/24 name-server 1.1.1.1
set service dhcp-server shared-network-name GUEST subnet 10.0.10.0/24 lease 3600

# VLAN 20 — IoT
set service dhcp-server shared-network-name IOT subnet 10.0.20.0/24 range 0 start 10.0.20.100
set service dhcp-server shared-network-name IOT subnet 10.0.20.0/24 range 0 stop 10.0.20.200
set service dhcp-server shared-network-name IOT subnet 10.0.20.0/24 default-router 10.0.20.1
set service dhcp-server shared-network-name IOT subnet 10.0.20.0/24 name-server 1.1.1.1
```

### DHCP Options

Push custom options (e.g., TFTP, NTP, vendor-specific):

```bash
# NTP server
set service dhcp-server shared-network-name LAN subnet 192.168.1.0/24 \
  subnet-parameters "option ntp-servers 192.168.1.1;"

# TFTP boot server (for PXE)
set service dhcp-server shared-network-name LAN subnet 192.168.1.0/24 \
  subnet-parameters "next-server 192.168.1.10;"
set service dhcp-server shared-network-name LAN subnet 192.168.1.0/24 \
  subnet-parameters "filename \"pxelinux.0\";"

# Custom DNS domain
set service dhcp-server shared-network-name LAN subnet 192.168.1.0/24 \
  domain home.lan
```

## DNS Forwarding

VyOS runs a DNS forwarder (PowerDNS recursor). Configure:

```bash
# Enable DNS forwarding
set service dns forwarding allow-from 192.168.0.0/16
set service dns forwarding listen-address 192.168.1.1
set service dns forwarding listen-address 10.0.10.1

# Upstream resolvers
set service dns forwarding name-server 1.1.1.1
set service dns forwarding name-server 8.8.8.8

# Cache size
set service dns forwarding cache-size 10000

# Negative cache (NXDOMAIN caching)
set service dns forwarding negative-ttl 300

# Listen on loopback too (for router itself)
set service dns forwarding listen-address 127.0.0.1
set service dns forwarding system
```

### Host Overrides (Split DNS)

Override specific hostnames locally:

```bash
set service dns forwarding domain home.lan server 192.168.1.100
set service dns forwarding domain internal.lab server 10.0.0.53

# Static host entries
set system static-host-mapping host-name router.home.lan inet 192.168.1.1
set system static-host-mapping host-name nas.home.lan inet 192.168.1.20
```

### Domain Blocking / Ad Blocking

```bash
# Forward unwanted domains to 0.0.0.0 (or a sinkhole)
set service dns forwarding negative-delivery
set service dns forwarding domain doubleclick.net server 0.0.0.0
set service dns forwarding domain googlesyndication.com server 0.0.0.0

# Or use a blocklist via script
# Better — use a dedicated adblock container/VM
```

## Dynamic DNS (DDNS)

Update a dynamic DNS provider when your WAN IP changes:

```bash
# Cloudflare example
set service dns dynamic name cf-dynamic interface eth0
set service dns dynamic name cf-dynamic service cloudflare
set service dns dynamic name cf-dynamic service cloudflare host-name router.example.com
set service dns dynamic name cf-dynamic service cloudflare login 'user@example.com'
set service dns dynamic name cf-dynamic service cloudflare password 'api-token'
set service dns dynamic name cf-dynamic service cloudflare zone example.com

# DuckDNS
set service dns dynamic name duckdns interface eth0
set service dns dynamic name duckdns service dyndns
set service dns dynamic name duckdns service dyndns server www.duckdns.org
set service dns dynamic name duckdns service dyndns host-name myrouter.duckdns.org
set service dns dynamic name duckdns service dyndns login ''
set service dns dynamic name duckdns service dyndns password 'your-token'

# Afraid.org (FreeDNS)
set service dns dynamic name afraid interface eth0
set service dns dynamic name afraid service afraid
set service dns dynamic name afraid service afraid host-name your-host.mooo.com
set service dns dynamic name afraid service afraid login 'username'
set service dns dynamic name afraid service afraid password 'password'
```

## Verify & Troubleshoot

```bash
# Show DHCP leases
show dhcp server leases

# Show DHCP statistics
show dhcp server statistics

# Show DNS forwarding stats
show dns forwarding statistics

# Test DNS resolution
nslookup google.com 192.168.1.1

# Check DDNS status
show dns dynamic status
```

## Complete Home Router DHCP+DNS

Putting it together — minimal config for a home router:

```bash
# DHCP
set service dhcp-server shared-network-name LAN subnet 192.168.1.0/24 range 0 start 192.168.1.100
set service dhcp-server shared-network-name LAN subnet 192.168.1.0/24 range 0 stop 192.168.1.200
set service dhcp-server shared-network-name LAN subnet 192.168.1.0/24 default-router 192.168.1.1
set service dhcp-server shared-network-name LAN subnet 192.168.1.0/24 name-server 192.168.1.1
set service dhcp-server shared-network-name LAN subnet 192.168.1.0/24 domain home.lan
set service dhcp-server shared-network-name LAN subnet 192.168.1.0/24 lease 86400

# DNS forwarding
set service dns forwarding allow-from 192.168.1.0/24
set service dns forwarding listen-address 192.168.1.1
set service dns forwarding name-server 1.1.1.1
set service dns forwarding name-server 8.8.8.8
set service dns forwarding cache-size 5000
```

## Next

[VPN →](../vpn)
