---
title: Server Deployment
description: "Step-by-step FreeIPA server installation on Rocky Linux : hostname setup, package installation, initialization, and verification."
sidebar:
  order: 1
---

# Server Deployment

This guide walks through installing and configuring a FreeIPA server on Rocky Linux 9.x. The setup includes the integrated DNS server, which is strongly recommended for service discovery.

## Environment

For this guide, we use the following reference setup:

| Hostname | IP | Role | OS |
|----------|----|------|-----|
| `ipa-server.example.internal` | `192.168.100.128` | FreeIPA Server (DNS, Kerberos, LDAP) | Rocky Linux 9.x |
| `client-1.example.internal` | `192.168.100.129` | Client (joined to domain) | Rocky Linux 9.x |
| `client-2.example.internal` | `192.168.100.130` | Client (joined to domain) | Rocky Linux 9.x |

:::tip
Replace `example.internal`, IP addresses, and hostnames with your own values throughout this guide.
:::

## Prerequisites

Run these checks on the server **before** starting the installation:

```bash
# 1. Time synchronization (Kerberos requires < 5 min drift)
timedatectl status

# 2. Network connectivity
ping 192.168.100.128

# 3. Hostname must be a proper FQDN
hostname -f

# 4. No DNS conflicts
getent hosts ipa-server.example.internal
```

**Why these matter:**

- Kerberos uses timestamps to prevent replay attacks, time drift causes auth failures
- FreeIPA relies on DNS for service discovery, network/DNS issues are the most common deployment failure
- FQDN must be correct, otherwise Kerberos tickets and certificates will fail validation

## Step 1: Set the Hostname

```bash
hostnamectl set-hostname ipa-server.example.internal
```

**Verify:**

```bash
hostname -f
# Must output: ipa-server.example.internal
```

:::caution
FreeIPA uses the hostname to generate the Kerberos realm and LDAP DN. An incorrect hostname will break certificates, DNS records, and Kerberos configuration.
:::

## Step 2: Configure `/etc/hosts`

```bash
cat >> /etc/hosts << 'EOF'
192.168.100.128 ipa-server.example.internal ipa-server
EOF
```

:::tip
**Format matters.** FQDN comes first, short name second:

```
# Correct
192.168.100.128 ipa-server.example.internal ipa-server

# Wrong : short name first
127.0.0.1 ipa-server ipa-server.example.internal
```

The `/etc/hosts` entry acts as bootstrap configuration when DNS is unavailable during system startup.
:::

## Step 3: Install FreeIPA Packages

```bash
dnf update -y
dnf install -y ipa-server ipa-server-dns
```

| Package | Purpose |
|---------|---------|
| `ipa-server` | FreeIPA core services |
| `ipa-server-dns` | Integrated DNS server (strongly recommended) |

**Expected size:** ~500 MB of packages, depending on what is already installed.

If you skip `ipa-server-dns`, you must configure external DNS manually, including SRV records for service discovery.

## Step 4: Run the Initialization Script

```bash
ipa-server-install --unattended \
  --setup-dns \
  --hostname=ipa-server.example.internal \
  --ip-address=192.168.100.128 \
  --domain=example.internal \
  --realm=EXAMPLE.INTERNAL \
  --ds-password='YourDS_P@55w0rd' \
  --admin-password='YourAdmin_P@55w0rd' \
  --forwarder=192.168.100.2 \
  --forward-policy=only \
  --auto-reverse \
  --no-dnssec-validation \
  --netbios-name=EXAMPLE \
  --mkhomedir \
  --ntp-server=pool.ntp.org
```

### Parameter reference

| Parameter | Meaning | Why |
|-----------|---------|-----|
| `--setup-dns` | Configure integrated DNS | FreeIPA auto-manages DNS records |
| `--hostname` | Server FQDN | Must match `hostnamectl` output |
| `--ip-address` | Server IP | Basis for forward/reverse DNS records |
| `--domain` | DNS domain (lowercase) | LDAP DN suffix, user email domain |
| `--realm` | Kerberos realm (uppercase) | Typically `DOMAIN` in uppercase |
| `--ds-password` | Directory Server password | LDAP backend root DN password |
| `--admin-password` | Admin user password | Web UI and CLI admin credentials |
| `--forwarder` | Upstream DNS server | Handles queries outside the FreeIPA domain |
| `--forward-policy=only` | DNS forward policy | Only forward non-local queries, avoid loops |
| `--auto-reverse` | Auto-configure reverse DNS | Creates PTR records (IP to hostname) |
| `--no-dnssec-validation` | Disable DNSSEC | Reduces complexity (enable in production) |
| `--mkhomedir` | Auto-create home dirs | Creates `/home/<user>` on first login |
| `--ntp-server` | NTP source | Synchronizes system time (critical for Kerberos) |

**Runtime:** 5 to 15 minutes, depending on network and disk speed.

## Step 5: Verify the Installation

```bash
ipactl status
```

**Successful output looks like this:**

```
Directory Service: RUNNING
krb5kdc Service: RUNNING
kadmin Service: RUNNING
named Service: RUNNING
httpd Service: RUNNING
ipa-custodia Service: RUNNING
pki-tomcatd Service: RUNNING
ipa-otpd Service: RUNNING
ipa-dnskeysyncd Service: RUNNING
ipa: INFO: The ipactl command was successful
```

### What each service does

| Service | Role |
|---------|------|
| `Directory Service` | LDAP directory database |
| `krb5kdc` | Kerberos ticket-granting service |
| `named` | DNS service |
| `httpd` | Web UI at `https://ipa-server.example.internal` |
| `pki-tomcatd` | Certificate authority |
| `ipa-otpd` | One-time password daemon |

## Firewall Configuration

Open all required FreeIPA ports:

```bash
firewall-cmd --permanent --add-service={freeipa-ldap,freeipa-ldaps,kerberos,kpasswd,dns,http,https,ntp}
firewall-cmd --reload

# Verify
firewall-cmd --list-services
```

### Key ports

| Port | Protocol | Service | Purpose |
|------|----------|---------|---------|
| 53 | UDP/TCP | DNS | Name resolution and service discovery |
| 88 | UDP/TCP | Kerberos | Ticket issuance |
| 389 | TCP | LDAP | Directory queries |
| 443 | TCP | HTTPS | Web UI, LDAPS |
| 464 | UDP/TCP | Kpasswd | Password changes |
| 123 | UDP | NTP | Time synchronization |

## Next Steps

- [Verify DNS and Kerberos](../dns-kerberos) to confirm the core services work
- [Join client machines](../client-integration) to the FreeIPA domain

---

> Adapted from [Dawn's Blog : FreeIPA Complete Deployment Guide](https://www.acdiost.com/posts/freeipa/).
