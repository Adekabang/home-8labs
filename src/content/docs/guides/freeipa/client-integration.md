---
title: Client Integration
description: "Join Rocky Linux clients to a FreeIPA domain : DNS configuration, ipa-client installation, enrollment, and verification."
sidebar:
  order: 3
---

# Client Integration

This guide covers joining Rocky Linux client machines to an existing FreeIPA domain. Each client must be able to resolve the FreeIPA server's DNS records before enrollment.

## Client Prerequisites

Run these steps on every client machine before joining the domain.

### 1. Set the Hostname

```bash
hostnamectl set-hostname client-1.example.internal
```

### 2. Configure DNS to Point at FreeIPA

```bash
# Set FreeIPA server as the primary DNS
nmcli con mod ens160 ipv4.method auto ipv4.dns "192.168.100.128" ipv4.ignore-auto-dns yes
nmcli con down ens160 && nmcli con up ens160

# Verify the DNS setting took effect
nmcli dev show | grep DNS
# IP4.DNS[1]: 192.168.100.128
```

:::tip
`ipv4.ignore-auto-dns yes` prevents DHCP from overwriting your DNS configuration. Adjust the interface name (`ens160`) to match your system.
:::

### 3. Test DNS Resolution

```bash
dig ipa-server.example.internal
```

The client must resolve the FreeIPA server's hostname. If this fails, all subsequent steps will fail.

## Install the Client Package

```bash
dnf install -y ipa-client
```

## Join the Domain

```bash
ipa-client-install --unattended \
  --hostname=client-1.example.internal \
  --domain=example.internal \
  --realm=EXAMPLE.INTERNAL \
  --server=ipa-server.example.internal \
  --principal=admin \
  --password='YourAdmin_P@55w0rd' \
  --mkhomedir \
  --enable-dns-updates \
  --ntp-server=pool.ntp.org
```

### Parameter reference

| Parameter | Meaning | Why |
|-----------|---------|-----|
| `--hostname` | Client FQDN | Registered in the FreeIPA directory |
| `--domain` / `--realm` | Must match the server | Ensures same authentication domain |
| `--server` | FreeIPA server hostname | Which server handles authentication |
| `--principal` / `--password` | Admin credentials | Used to create the host record on the server |
| `--mkhomedir` | Auto-create home dirs | Creates `/home/<user>` on first login |
| `--enable-dns-updates` | DNS self-registration | Updates DNS automatically on IP changes |
| `--ntp-server` | NTP source | Keeps time synced with the server |

**Runtime:** 2 to 5 minutes.

## Verify the Client Joined Successfully

```bash
# 1. Look up an IPA user
id admin
# uid=1600000000(admin) gid=1600000000(admins) groups=1600000000(admins)

# 2. Check SSSD status
systemctl status sssd

# 3. Clear and refresh SSSD cache
sss_cache -u admin

# 4. Check Kerberos configuration
cat /etc/krb5.conf | grep -A 5 "EXAMPLE.INTERNAL"

# 5. Test SSH login
ssh admin@client-1
# First login requires the FreeIPA user password
```

## Uninstalling a Client

To remove a client from the domain:

```bash
ipa-client-install --uninstall
```

Also remove the host record from the FreeIPA server:

```bash
# On the FreeIPA server
ipa host-del client-1.example.internal
```

## Next Steps

- [Create users and manage permissions](../user-management) through FreeIPA
- [Troubleshoot common issues](../troubleshooting) if something goes wrong

---

> Adapted from [Dawn's Blog : FreeIPA Complete Deployment Guide](https://www.acdiost.com/posts/freeipa/).
