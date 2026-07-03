---
title: Command Reference
description: "Quick reference for common FreeIPA commands : host management, DNS, Kerberos, SSSD, certificates, and the web UI."
sidebar:
  order: 6
---

# Command Reference

A quick reference for day-to-day FreeIPA administration tasks.

## Host Management

```bash
# List all hosts
ipa host-find

# Show a specific host
ipa host-show client-1.example.internal

# Delete a host record (after client uninstall)
ipa host-del client-1.example.internal
```

## DNS Management

```bash
# Find DNS records for a host
ipa dnsrecord-find example.internal client-1

# Add an A record
ipa dnsrecord-add example.internal client-1 --a-rec=192.168.100.129

# Add a PTR record (reverse)
ipa dnsrecord-add 100.168.192.in-addr.arpa 129 --ptr-rec=client-1.example.internal.

# Delete a DNS record
ipa dnsrecord-del example.internal client-1 --a-rec=192.168.100.129

# List DNS zones
ipa dnszone-find
```

## Kerberos Management

```bash
# Obtain a ticket
kinit admin

# View current ticket
klist

# Destroy ticket
kdestroy

# List service principals
ipa service-find

# Add a service principal for custom applications
ipa service-add HTTP/myapp.example.internal

# Generate a service keytab
ipa-getkeytab -s ipa-server.example.internal \
  -p HTTP/myapp.example.internal \
  -k /etc/myapp/krb5.keytab
```

## SSSD Cache Management

```bash
# Clear a specific user's cache
sss_cache -u testuser

# Clear all cache
sss_cache -E

# Follow SSSD logs in real time
journalctl -u sssd -f

# Increase SSSD log level for debugging
sss_debuglevel 7
```

## Certificate Management

```bash
# Download the FreeIPA CA certificate
curl -k -O https://ipa-server.example.internal/ipa/config/ca.crt

# Trust the certificate on a client
cp ca.crt /etc/pki/ca-trust/source/anchors/
update-ca-trust

# List issued certificates
ipa cert-find

# Revoke a certificate
ipa cert-revoke <serial_number>
```

## Web UI

Access the management interface:

```
https://ipa-server.example.internal
```

- **Username:** `admin`
- **Password:** Set during `ipa-server-install`

The web UI provides the same functionality as the CLI but with a graphical interface for user, host, DNS, and policy management.

## Sudo Rules

```bash
# Create a rule
ipa sudorule-add allow-all

# Allow all commands on all hosts
ipa sudorule-mod allow-all --cmdcat=all --hostcat=all

# Add users
ipa sudorule-add-user allow-all --users=devops01

# Create specific command objects
ipa sudocmd-add /usr/bin/systemctl
ipa sudocmd-add /usr/bin/journalctl

# Assign commands to a rule
ipa sudorule-add-allow-command operator-access --sudocmds=/usr/bin/systemctl
ipa sudorule-add-allow-command operator-access --sudocmds=/usr/bin/journalctl

# Verify
ipa sudorule-show operator-access
```

## Quick Health Check

```bash
# All services running?
ipactl status

# Kerberos working?
echo "Admin_p@55w0rd" | kinit admin && klist && kdestroy

# DNS resolving?
dig @localhost ipa-server.example.internal +short
dig -x 192.168.100.128 @localhost +short

# Firewall ports open?
firewall-cmd --list-services
```

## Troubleshooting Flow

When something breaks, check in this order:

1. **DNS** : Can clients resolve the server?
2. **Network** : Are required ports open? (53, 88, 389, 443)
3. **SSSD** : Is `systemctl status sssd` healthy?
4. **LDAP** : `journalctl -u dirsrv -n 50`
5. **Kerberos** : `kinit -V testuser`

---

> Adapted from [Dawn's Blog : FreeIPA Complete Deployment Guide](https://www.acdiost.com/posts/freeipa/).
