---
title: Configuration Backup with Git
description: Automatically back up VyOS config to a Git repository on every commit for versioned history, off-router storage, rollback.
sidebar:
  order: 8
---

# Configuration Backup with Git

Every VyOS `commit` can trigger a script. This guide sets up a **post-commit hook** that exports your config, commits it to a local Git repo, and pushes to a remote — giving you full version history of every router change.

Based on [brav0charlie's workflow](https://web.archive.org/web/20241211212218/https://blog.billclark.io/vyos-configuration-backup-automation-with-git) (original blog offline, preserved via Wayback Machine). Adapted for VyOS 1.4+.

## Architecture

```
VyOS Router                          Git Server (Gitea/GitHub/GitLab)
┌──────────────────────────┐         ┌─────────────────────┐
│ commit                   │         │                     │
│   ↓                      │         │  config-router01/   │
│ post-hook script:        │  push   │  ├── router01       │
│  1. export config        │────────▶│  │   .commands.conf │
│  2. git add -A           │         │  │   .config.boot    │
│  3. git commit           │         │  └── ...            │
│  4. git push             │         │                     │
└──────────────────────────┘         └─────────────────────┘
```

## Prerequisites

### Git on VyOS

The default VyOS ISO does **not** include Git. You have two options:

1. **Build a custom image** with Git included (see [Image Automation](../image-automation))
2. **Install Git on a running system** (won't survive upgrades):

```bash
# Temporary — lost on reboot/upgrade
sudo apt update && sudo apt install -y git
```

Preferred: build a custom image. One-time effort, permanent result.

### SSH Agent Forwarding

So your router can push to the remote without storing keys on it:

```bash
# ~/.ssh/config on your LOCAL machine
Host vyos-router
    HostName 192.168.1.1
    User admin
    ForwardAgent yes
```

### Git Repository

Create a **private** repository. Never make router configs public — they contain secrets, keys, and network topology.

Recommended: self-hosted Gitea in Docker, or private GitHub/GitLab repo.

## Setup

### 1. Clone Repo on VyOS

```bash
# Log into VyOS, set Git identity
git config --global user.name "VyOS Router"
git config --global user.email "vyos@home.lan"

# Clone into persistent storage
cd /config/user-data
git clone git@git.internal:infra/config-router01.git
```

`/config/user-data` persists across reboots and upgrades. Everything else in `/` is ephemeral.

### 2. Create the Post-Commit Hook

```bash
sudo mkdir -p /config/scripts/commit/post-hooks.d
sudo nano /config/scripts/commit/post-hooks.d/99-git-commit
```

Paste the script:

```bash
#!/bin/vbash

# Post-commit hook: export config, commit to git, push
# Install: /config/scripts/commit/post-hooks.d/99-git-commit

REPO_PATH=/config/user-data
CONFIG_REPO=config-router01       # <-- change this
TIMESTAMP="$(date '+%Y-%m-%dT%H:%M:%S %Z')"

# Commit message — set env var $M for custom message
# Usage: M="added VLAN 20" commit;save
if [ -z "$M" ]; then
  MSG="Auto-commit by $USER@$HOSTNAME: $TIMESTAMP"
else
  MSG="$M"
fi

# Source VyOS script functions
source /opt/vyatta/etc/functions/script-template

USERPATH=$PWD
cd $REPO_PATH/$CONFIG_REPO
echo "> [$TIMESTAMP] Beginning git commit & push..."

# Pull latest
/usr/bin/git pull

# Export config in two formats
run show configuration commands > $REPO_PATH/$CONFIG_REPO/$HOSTNAME.commands.conf
run show configuration commands json > $REPO_PATH/$CONFIG_REPO/$HOSTNAME.config.json

# Git workflow
/usr/bin/git add -A
/usr/bin/git commit -m "$MSG"
/usr/bin/git push

echo "> [$TIMESTAMP] Git commit & push completed."
cd $USERPATH

# Clean up
CONFIG_REPO=""
REPO_PATH=""
TIMESTAMP=""
USERPATH=""
MSG=""
M=""
```

### 3. Make Executable

```bash
sudo chmod +x /config/scripts/commit/post-hooks.d/99-git-commit
```

## Usage

Every `commit` now triggers the backup:

```bash
configure
set system host-name vyos-gw-new
commit
save
# → Script runs, pushes config to Git
```

Custom commit message:

```bash
# Set $M before commit
M="Changed WAN DNS to Cloudflare" commit;save
```

## What You Get

Two files per commit in your repo:

| File | Content |
|------|---------|
| `hostname.commands.conf` | Full config as `set` commands — human-readable, diffable |
| `hostname.config.json` | Full config as JSON — machine-parseable |

```bash
# View history
git log --oneline

# See what changed
git diff HEAD~1 hostname.commands.conf

# Restore a previous config
git show abc1234:hostname.commands.conf
```

## Restoring from Backup

If your router dies, restore the config to a fresh VyOS install:

```bash
# On new VyOS
cd /config/user-data
git clone git@git.internal:infra/config-router01.git
cd config-router01

# Load saved config
configure
load hostname.commands.conf
commit
save
```

## Alternative: Manual Script (No Hook)

If you prefer manual control, skip the hook and run on-demand:

```bash
# /config/scripts/backup-config.sh
cd /config/user-data/config-router01
run show configuration commands > $(hostname).commands.conf
run show configuration commands json > $(hostname).config.json
git add -A
git commit -m "Manual backup $(date -Iseconds)"
git push
```

Run it: `source /config/scripts/backup-config.sh`

## Sanitizing Secrets (Optional)

If you must use a less-private repo, filter secrets before commit:

```bash
# Add before git add in post-hook
sed -i '/plaintext-password/d' $HOSTNAME.commands.conf
sed -i '/pre-shared-secret/d' $HOSTNAME.commands.conf
sed -i '/private-key/d' $HOSTNAME.commands.conf
```

Better: use a private self-hosted repo and don't sanitize — you want the full config for disaster recovery.

## Verification

```bash
# Check hook is in place
ls -la /config/scripts/commit/post-hooks.d/

# Test manually
sudo /config/scripts/commit/post-hooks.d/99-git-commit

# Check Git status
cd /config/user-data/config-router01
git log --oneline -5
```

## Summary

| Step | Command |
|------|---------|
| Build image with Git | `--custom-package git` (see image automation guide) |
| Clone repo | `cd /config/user-data && git clone <url>` |
| Create hook | `/config/scripts/commit/post-hooks.d/99-git-commit` |
| Use | `commit;save` — backed up automatically |
| Custom message | `M="description" commit;save` |
