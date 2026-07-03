---
title: User Management
description: "Manage FreeIPA users, groups, SSH keys, sudo rules, and password policies : centralized identity administration for Linux infrastructure."
sidebar:
  order: 4
---

# User Management

FreeIPA centralizes user and permission management. Users created on the server are immediately available on all joined clients.

## Creating Users

### Standard User

```bash
ipa user-add testuser \
  --first=Test \
  --last=User \
  --password
```

The `--password` flag prompts interactively. To set a password non-interactively, use `--password='value'` instead.

### Full User Record

```bash
ipa user-add devops01 \
  --first=Devops \
  --last=Admin \
  --email=devops01@example.internal \
  --phone=+1-555-123-4567 \
  --uid=2001 \
  --gidnumber=2001 \
  --login-shell=/bin/bash \
  --homedir=/home/devops01 \
  --password
```

:::tip
Assign UIDs starting from **2000** to avoid collisions with system accounts (typically below 1000).
:::

### Service Account (No Login)

For daemon accounts like Slurm, Prometheus, or application services:

```bash
ipa user-add slurm \
  --first=Slurm \
  --last=Service \
  --uid=202 \
  --gidnumber=202 \
  --noprivate \
  --shell=/sbin/nologin \
  --homedir=/var/lib/slurm
```

| Flag | Purpose |
|------|---------|
| `--noprivate` | No private user group |
| `--shell=/sbin/nologin` | Block interactive login |
| `--homedir` | Place in service directory instead of `/home` |

## Creating Groups

```bash
# Create a group
ipa group-add engineers \
  --gid=3000 \
  --desc="Engineering team"

# Add members
ipa group-add-member engineers --users=testuser,devops01
```

## Querying Users and Groups

```bash
# Single user, full details
ipa user-find testuser --all

# All users
ipa user-find

# Group membership
ipa group-show engineers
```

## Password Management

```bash
# Admin resets a user's password
ipa passwd testuser

# User changes their own password
passwd
```

### Password Expiration Policy

```bash
# View default policy
ipa pwpolicy-find

# Set expiration to 90 days
ipa user-mod testuser --password-expiration=$(date -d '+90 days' +%Y%m%d%H%M%SZ)
```

## SSH Public Key Authentication

Store SSH public keys in FreeIPA for passwordless login across all clients:

```bash
ipa user-mod testuser --sshpubkey="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... testuser@host"
```

Verify on any client:

```bash
ssh testuser@client-1
# No password required
```

Combined with Kerberos, this gives you true passwordless authentication across your infrastructure.

## Sudo Rules

Grant sudo access through FreeIPA instead of editing `/etc/sudoers` on individual machines:

```bash
# Create a sudo rule
ipa sudorule-add allow-all

# Allow all commands on all hosts
ipa sudorule-mod allow-all --cmdcat=all
ipa sudorule-mod allow-all --hostcat=all

# Add a user to the rule
ipa sudorule-add-user allow-all --users=devops01
```

### Granular Command Access

```bash
# Define specific allowed commands
ipa sudocmd-add /usr/bin/systemctl
ipa sudocmd-add /usr/bin/journalctl

# Add them to a rule
ipa sudorule-add-allow-command operator-access --sudocmds=/usr/bin/systemctl
ipa sudorule-add-allow-command operator-access --sudocmds=/usr/bin/journalctl

# Assign users
ipa sudorule-add-user operator-access --users=testuser

# Verify
ipa sudorule-show operator-access
```

## Deleting Users

```bash
ipa user-del testuser
```

## Next Steps

- [Troubleshoot issues](../troubleshooting) like login timeouts or missing users
- Quick [command reference](../command-reference) for day-to-day operations

---

> Adapted from [Dawn's Blog : FreeIPA Complete Deployment Guide](https://www.acdiost.com/posts/freeipa/).
