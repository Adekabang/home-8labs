---
title: DNS & Kerberos
description: "Verify FreeIPA DNS records (forward, reverse, SRV) and Kerberos authentication : confirm core services are working before joining clients."
sidebar:
  order: 2
---

# DNS & Kerberos Verification

After installing the FreeIPA server, verify that DNS and Kerberos are functioning correctly before attempting to join any clients. These two services form the backbone of FreeIPA, and issues here will cascade into every other failure.

## Kerberos Authentication

FreeIPA uses Kerberos for passwordless authentication. This is the core identity mechanism.

### Obtain a Kerberos Ticket

```bash
kinit admin
# Enter the admin password you set during installation
```

`kinit` requests a TGT (Ticket Granting Ticket) from the Kerberos KDC. The TGT acts as your "master pass" for the next 24 hours, allowing you to access any Kerberized service without re-entering your password.

### Inspect the Current Ticket

```bash
klist
```

**Expected output:**

```
Ticket cache: KCM:0
Default principal: admin@EXAMPLE.INTERNAL

Valid starting     Expires            Service principal
04/18/26 10:00:00 04/19/26 10:00:00  krbtgt/EXAMPLE.INTERNAL@EXAMPLE.INTERNAL
```

| Field | Meaning |
|-------|---------|
| `Default principal` | The authenticated user |
| `Valid starting / Expires` | Ticket validity window |
| `Service principal` | The service this ticket grants access to |

### Destroy the Ticket

```bash
kdestroy           # Log out
klist -l           # List all sessions
```

## DNS Verification

FreeIPA's integrated DNS must be fully functional. Without it, clients cannot discover services or join the domain.

### Forward Resolution (Hostname to IP)

```bash
dig @localhost ipa-server.example.internal +short
# Should return: 192.168.100.128
```

If the record is missing:

```bash
ipa dnsrecord-find example.internal ipa-server
ipa dnsrecord-add example.internal ipa-server --a-rec=192.168.100.128
```

### Reverse Resolution (IP to Hostname)

```bash
dig -x 192.168.100.128 @localhost +short
# Should return: ipa-server.example.internal.
```

Reverse DNS is used for logging, auditing, and security validations like SSH. Missing reverse records cause connection delays.

If missing:

```bash
ipa dnszone-find
# Should include 100.168.192.in-addr.arpa

ipa dnsrecord-add 100.168.192.in-addr.arpa 128 --ptr-rec=ipa-server.example.internal.
```

### SRV Records (Service Discovery)

SRV records let clients automatically discover FreeIPA services:

```bash
dig SRV _ldap._tcp.example.internal @localhost
dig SRV _kerberos._tcp.example.internal @localhost
```

Both must return results pointing to your FreeIPA server. If SRV records are absent, clients will fail to join the domain.

## Quick Health Check

Run these commands in sequence. All should succeed:

```bash
# 1. Kerberos
kinit admin && klist && kdestroy

# 2. Forward DNS
dig @localhost ipa-server.example.internal +short

# 3. Reverse DNS
dig -x 192.168.100.128 @localhost +short

# 4. SRV records
dig SRV _ldap._tcp.example.internal @localhost
dig SRV _kerberos._tcp.example.internal @localhost

# 5. All services running
ipactl status
```

## Next Step

With DNS and Kerberos confirmed working, [join your first client](../client-integration) to the domain.

---

> Adapted from [Dawn's Blog : FreeIPA Complete Deployment Guide](https://www.acdiost.com/posts/freeipa/).
