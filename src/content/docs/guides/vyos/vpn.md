---
title: VPN — WireGuard & IPsec
description: Site-to-site and road-warrior VPN with WireGuard and IPsec IKEv2 on VyOS. Performance comparison and when to use each.
---

# VPN: WireGuard & IPsec

VyOS supports both WireGuard (kernel-native, fast, simple) and IPsec/IKEv2 (standards-compatible, broad client support). Choose based on your needs:

|  | WireGuard | IPsec IKEv2 |
|--|-----------|-------------|
| **Performance** | Excellent (in-kernel) | Very good (hardware offload) |
| **Complexity** | Minimal — key exchange only | Complex — IKE, ESP, certificates |
| **Roaming** | Built-in (stateless) | MOBIKE (IKEv2 extension) |
| **Client support** | All major OS | Native on iOS/macOS/Windows |
| **Site-to-site** | Excellent | Excellent |
| **Port** | UDP 51820 (default) | UDP 500, 4500 + ESP |

## WireGuard

### Site-to-Site

Two VyOS routers connected over WireGuard:

**Router A (192.168.1.0/24) — public IP 203.0.113.10:**

```bash
# Generate keys
generate wireguard key-pair

# Configure tunnel
set interfaces wireguard wg01 description 'Site-to-Site B'
set interfaces wireguard wg01 address 10.255.254.1/30
set interfaces wireguard wg01 peer site-b allowed-ips 192.168.2.0/24
set interfaces wireguard wg01 peer site-b public-key '<RouterB-public-key>'
set interfaces wireguard wg01 peer site-b endpoint 198.51.100.20:51820
set interfaces wireguard wg01 private-key '<RouterA-private-key>'
set interfaces wireguard wg01 port 51820

# Route to remote LAN
set protocols static route 192.168.2.0/24 interface wg01
```

**Router B (192.168.2.0/24) — public IP 198.51.100.20:**

```bash
set interfaces wireguard wg01 description 'Site-to-Site A'
set interfaces wireguard wg01 address 10.255.254.2/30
set interfaces wireguard wg01 peer site-a allowed-ips 192.168.1.0/24
set interfaces wireguard wg01 peer site-a public-key '<RouterA-public-key>'
set interfaces wireguard wg01 peer site-a endpoint 203.0.113.10:51820
set interfaces wireguard wg01 private-key '<RouterB-private-key>'
set interfaces wireguard wg01 port 51820

set protocols static route 192.168.1.0/24 interface wg01
```

### Road Warrior (Client VPN)

Allow laptops/phones to connect into your network:

```bash
# VyOS server side
set interfaces wireguard wg02 description 'Road Warrior VPN'
set interfaces wireguard wg02 address 10.255.255.1/24
set interfaces wireguard wg02 private-key '<server-private-key>'
set interfaces wireguard wg02 port 51821

# Peer: laptop
set interfaces wireguard wg02 peer laptop allowed-ips 10.255.255.10/32
set interfaces wireguard wg02 peer laptop public-key '<laptop-public-key>'

# Peer: phone
set interfaces wireguard wg02 peer phone allowed-ips 10.255.255.20/32
set interfaces wireguard wg02 peer phone public-key '<phone-public-key>'
```

Client config (laptop):

```ini
[Interface]
PrivateKey = <laptop-private-key>
Address = 10.255.255.10/32
DNS = 192.168.1.1

[Peer]
PublicKey = <server-public-key>
Endpoint = 203.0.113.10:51821
AllowedIPs = 192.168.1.0/24, 10.255.255.0/24
```

### Firewall for WireGuard

```bash
# Allow WireGuard on WAN
set firewall ipv4 name WAN-to-LOCAL rule 40 action accept
set firewall ipv4 name WAN-to-LOCAL rule 40 destination port 51820,51821
set firewall ipv4 name WAN-to-LOCAL rule 40 protocol udp

# If you want road warriors to reach LAN
set firewall ipv4 name WAN-to-LAN rule 20 action accept
set firewall ipv4 name WAN-to-LAN rule 20 source address 10.255.255.0/24
set firewall ipv4 name WAN-to-LAN rule 20 destination address 192.168.1.0/24
```

## IPsec IKEv2

### Site-to-Site with Pre-Shared Key

```bash
# Router A
set vpn ipsec esp-group ESP-AES256 proposal 1 encryption aes256
set vpn ipsec esp-group ESP-AES256 proposal 1 hash sha256
set vpn ipsec esp-group ESP-AES256 lifetime 3600

set vpn ipsec ike-group IKE-AES256 proposal 1 encryption aes256
set vpn ipsec ike-group IKE-AES256 proposal 1 hash sha256
set vpn ipsec ike-group IKE-AES256 proposal 1 dh-group 14
set vpn ipsec ike-group IKE-AES256 lifetime 28800

set vpn ipsec site-to-site peer 198.51.100.20 authentication mode pre-shared-secret
set vpn ipsec site-to-site peer 198.51.100.20 authentication pre-shared-secret 'Str0ngPSK!'
set vpn ipsec site-to-site peer 198.51.100.20 ike-group IKE-AES256
set vpn ipsec site-to-site peer 198.51.100.20 default-esp-group ESP-AES256
set vpn ipsec site-to-site peer 198.51.100.20 local-address 203.0.113.10

set vpn ipsec site-to-site peer 198.51.100.20 tunnel 1 \
  local prefix 192.168.1.0/24
set vpn ipsec site-to-site peer 198.51.100.20 tunnel 1 \
  remote prefix 192.168.2.0/24
```

### Road Warrior with Certificate Auth

```bash
# Certificate-based IKEv2 (simplified)
set vpn ipsec esp-group ESP-AES256 proposal 1 encryption aes256
set vpn ipsec esp-group ESP-AES256 proposal 1 hash sha256

set vpn ipsec ike-group IKE-AES256 proposal 1 encryption aes256
set vpn ipsec ike-group IKE-AES256 proposal 1 hash sha256
set vpn ipsec ike-group IKE-AES256 proposal 1 dh-group 14

# Remote access pool
set vpn ipsec remote-access pool ra-pool prefix 10.255.253.0/24
set vpn ipsec remote-access pool ra-pool name-server 192.168.1.1

# CA and server certificate
set vpn ipsec authentication pki ca VyOS-CA certificate '<ca-cert>'
set vpn ipsec authentication pki server vyos-server certificate '<server-cert>'
set vpn ipsec authentication pki server vyos-server private key '<server-key>'

# Remote access connection
set vpn ipsec remote-access connection ra-vpn authentication server-certificate vyos-server
set vpn ipsec remote-access connection ra-vpn authentication client-certificate require
set vpn ipsec remote-access connection ra-vpn authentication ca-certificate VyOS-CA
set vpn ipsec remote-access connection ra-vpn ike-group IKE-AES256
set vpn ipsec remote-access connection ra-vpn esp-group ESP-AES256
set vpn ipsec remote-access connection ra-vpn local-address 203.0.113.10
set vpn ipsec remote-access connection ra-vpn pool ra-pool
```

### IPsec Firewall Rules

```bash
# Allow IKE and ESP/NAT-T
set firewall ipv4 name WAN-to-LOCAL rule 50 action accept
set firewall ipv4 name WAN-to-LOCAL rule 50 destination port 500
set firewall ipv4 name WAN-to-LOCAL rule 50 protocol udp

set firewall ipv4 name WAN-to-LOCAL rule 51 action accept
set firewall ipv4 name WAN-to-LOCAL rule 51 destination port 4500
set firewall ipv4 name WAN-to-LOCAL rule 51 protocol udp

set firewall ipv4 name WAN-to-LOCAL rule 52 action accept
set firewall ipv4 name WAN-to-LOCAL rule 52 protocol esp
```

## Which VPN to choose?

```
Choose WireGuard when:
  ✓ Simplicity matters
  ✓ Linux/Unix-heavy environment
  ✓ Maximum throughput needed
  ✓ NAT traversal not critical

Choose IPsec when:
  ✓ iOS/macOS/Windows native client needed
  ✓ Corporate/enterprise standards required
  ✓ Hardware crypto offload available
  ✓ Need to interoperate with non-Linux peers
```

Personally, I use WireGuard for site-to-site and personal devices, IPsec only when a client platform can't do WireGuard.

## Verify

```bash
# WireGuard
show interfaces wireguard wg01
show interfaces wireguard wg01 peer site-b
show interfaces wireguard statistics

# IPsec
show vpn ipsec sa
show vpn ipsec status
show vpn ipsec statistics
```

## Next

[Routing →](./routing)
