---
title: Troubleshooting
description: "Common FreeIPA errors and their solutions : DNS failures, Kerberos clock skew, SSSD issues, backup/restore, and production hardening."
sidebar:
  order: 5
---

# Troubleshooting

This page covers the most common FreeIPA deployment issues, backup and recovery, and production hardening advice.

## Common Deployment Errors

### Error: DNS Resolution Failed

**Symptom:**

```
ipa-server-install: ERROR: DNS resolution of ipa-server.example.internal failed
```

**Diagnosis:**

```bash
cat /etc/hosts | grep ipa-server
getent hosts ipa-server.example.internal
cat /etc/resolv.conf
```

**Fix:** Ensure `/etc/hosts` has the correct entry with FQDN first:

```bash
echo "192.168.100.128 ipa-server.example.internal ipa-server" >> /etc/hosts
```

### Error: NTP Synchronization Failed

**Symptom:**

```
ipa-server-install: ERROR: NTP synchronization failed
```

**Diagnosis:**

```bash
systemctl status chronyd
chronyc sources
chronyc makestep
timedatectl status
```

**Fix:** If the NTP source is unreachable or blocked by firewall:

```bash
systemctl stop chronyd
ntpdate pool.ntp.org
systemctl start chronyd
```

**Root cause:** NTP source unreachable or UDP port 123 blocked.

### Error: Kerberos Key Table Already Exists

**Symptom:**

```
ipa-server-install: ERROR: The Kerberos key table already exists
```

**Fix:**

```bash
ipa-server-install --uninstall
rm -f /etc/krb5.keytab
# Then re-run ipa-server-install
```

### Error: Directory Server Failed to Start

**Symptom:**

```
ipa-server-install: ERROR: Directory Server failed to start
```

**Diagnosis:**

```bash
journalctl -u dirsrv -n 50
df -h /var
ss -tlnp | grep 389
getenforce
```

**Common causes:** Disk full, port 389 already in use, or overly restrictive SELinux policies.

## Client-Side Issues

### SSH Login Timeout

**Symptom:** `ssh testuser@client-1` hangs and eventually times out.

**Diagnosis:**

```bash
systemctl status sssd
journalctl -u sssd -n 100
ping ipa-server.example.internal
dig +short ipa-server.example.internal
cat /etc/krb5.conf
kinit -V testuser
```

**Common fixes:**

| Cause | Solution |
|-------|----------|
| Network/DNS unreachable | Check firewall, DNS config |
| SSSD not running | `systemctl start sssd` |
| SELinux blocking | `getenforce`, then `setenforce 0` to test |
| Misconfigured Kerberos | Verify `[realm]` and `[domain_realm]` in `/etc/krb5.conf` |

### User Not Found on Client

**Symptom:**

```
id testuser
# id: 'testuser': no such user
```

**Diagnosis:**

```bash
# Does the user exist on the server?
ipa user-find testuser

# Clear the SSSD cache
sss_cache -u testuser

# Check NSS configuration
grep sss /etc/nsswitch.conf

# Manual LDAP lookup
ldapsearch -x -h ipa-server.example.internal -b "cn=users,cn=accounts,dc=example,dc=internal" uid=testuser
```

**Common causes:** User not created, SSSD not synced, `sss` missing from `/etc/nsswitch.conf`, or LDAP connection blocked.

### Password Change Not Recognized

**Symptom:** After `ipa passwd testuser`, the new password fails.

**Fix:**

```bash
kdestroy -A                  # Clear Kerberos tickets
sss_cache -u testuser        # Clear SSSD cache
sleep 30                     # Wait for SSSD sync
ssh testuser@client-1        # Retry
```

**Root cause:** SSSD caches credentials. Changes need cache flush or sync delay to propagate.

### Kerberos Clock Skew

**Symptom:**

```
kinit testuser
# KDC returned error string: SKEW(Clock skew too great)
```

**Diagnosis:**

```bash
timedatectl status
date
chronyc sources
```

**Fix:**

```bash
chronyc makestep                    # Force NTP sync
ntpdate -s pool.ntp.org             # Fallback manual sync

# If the server and client times differ:
ssh ipa-server 'date'
date --set="$(ssh ipa-server date)" # Match server time manually
```

**Root cause:** NTP misconfigured or not running. Kerberos requires time difference under 5 minutes.

## Backup and Recovery

### Create a Backup

```bash
ipa-backup
# Creates: /var/lib/ipa/backup/ipa-full-YYYY-MM-DD-HH-MM-SS.tar.gz
```

**What gets backed up:** LDAP database, Kerberos keys, PKI certificates, DNS zone data, and configuration files.

Schedule regular backups:

```cron
0 2 * * 0 /usr/sbin/ipa-backup
```

### Restore from Backup

```bash
ls -la /var/lib/ipa/backup/
ipa-restore /var/lib/ipa/backup/ipa-full-YYYY-MM-DD-HH-MM-SS.tar.gz
ipactl status
```

:::danger
`ipa-restore` stops all FreeIPA services during restoration. Plan for downtime.
:::

## Uninstalling FreeIPA

### Uninstall a Client

```bash
ipa-client-install --uninstall
```

### Uninstall the Server

```bash
# WARNING: This destroys all FreeIPA data
ipa-server-install --uninstall

# Remove residual files (only if you are sure)
rm -rf /etc/ipa /var/lib/ipa
```

## Production Hardening

### High Availability

FreeIPA supports master-replica architecture for LDAP data replication. Set up a second server as a replica:

- DNS should resolve to a load-balanced address (e.g., `ipa.example.internal` pointing to both IPs)
- Each replica independently runs DNS, Kerberos, and CA services
- Reference: [FreeIPA Replica Setup](https://www.freeipa.org/page/V4/Replica_Setup)

### Security Hardening

- Use SSH key authentication instead of passwords
- Store admin and DS passwords in a secure vault
- Enable DNSSEC validation (remove `--no-dnssec-validation`)
- Keep SELinux enabled, adjust policies instead of disabling

### Performance Tuning

- **LDAP cache:** SSSD caches by default for 1–2 hours; adjust based on user change frequency
- **DNS cache:** Increase TTL (e.g., 3600 seconds) for stable environments
- **Connection pooling:** FreeIPA manages this automatically

## Systematic Debugging

When troubleshooting, follow this order:

**DNS → Network → SSSD → LDAP → Kerberos**

Most FreeIPA failures trace back to a broken link somewhere in this chain. Start at the top and work down.

## Next Step

- [Command reference](../command-reference) for everyday FreeIPA operations

---

> Adapted from [Dawn's Blog : FreeIPA Complete Deployment Guide](https://www.acdiost.com/posts/freeipa/).
