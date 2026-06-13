---
title: VyOS Installation
description: Installing VyOS on bare metal, VMs, and cloud VPS — ISO download, initial setup, and image customization.
sidebar:
  order: 1
---

# Installing VyOS

VyOS runs on any x86_64 system. Minimum: 2 GB RAM, 8 GB storage, 1 CPU core. For production: 4 GB RAM, 20+ GB storage.

## Download

VyOS has two release tracks:

| Track | Version | Access | Best for |
|-------|---------|--------|----------|
| **Rolling** | 1.5 Circinus | **Free** — [vyos.net/get](https://vyos.net/get/) | Lab, testing, latest features |
| **LTS** | 1.4 Sagitta | **Contributor or subscription** | Production, stability-critical |

### Rolling (Free)

Rolling/nightly builds are freely available to everyone. Download the latest ISO from [vyos.net/get](https://vyos.net/get/) — no registration needed for nightly images.

### LTS (Gated)

LTS ISOs are not publicly downloadable. Two ways to get them:

1. **Become an active contributor** — code, docs, testing, or community work. Active contributors get free LTS access. [Start contributing →](https://vyos.net/community/)
2. **LTS subscription** — paid access with support. [Pricing →](https://vyos.net/subscriptions/)

### Build LTS ISO Yourself (Free)

The LTS **source code** is fully public on GitHub. Prebuilt ISOs are gated, but you can build them yourself:

```bash
# Clone vyos-build
git clone -b sagitta --single-branch https://github.com/vyos/vyos-build
cd vyos-build

# Build LTS ISO using the sagitta Docker image
docker run --rm --privileged \
  -v $(pwd):/vyos -w /vyos \
  vyos/vyos-build:sagitta \
  sudo ./build-vyos-image iso
```

Available LTS Docker tags:

| Tag | Version | Date |
|-----|---------|------|
| `sagitta` | Latest LTS (rolling) | Updated regularly |
| `1.4.4` | 1.4.4 (stable) | Dec 2025 |
| `1.4.3` | 1.4.3 (stable) | Jul 2025 |
| `1.4.2` | 1.4.2 (stable) | Apr 2025 |

To build a **specific LTS point release** — recommended for production:

```bash
# Build VyOS 1.4.4 specifically
docker run --rm --privileged \
  -v $(pwd):/vyos -w /vyos \
  vyos/vyos-build:1.4.4 \
  sudo ./build-vyos-image iso
```

> Prefer a specific version tag (`1.4.4`) over `sagitta` for production — you get a known-good point release instead of whatever the latest LTS branch HEAD happens to be.

This produces the same LTS code that subscribers get — just without commercial support. The `sagitta` branch still receives backported fixes (last updated June 2026).

> Build takes 10-20 minutes. Works on any Linux with Docker. See [Image Automation](../image-automation) for automating this with cron/CI.

### "Stable Rolling" Strategy

If building from LTS source isn't an option, pin a known-good rolling release:

1. Download a specific dated ISO from [vyos.net/get](https://vyos.net/get/)
2. Test it in a VM first (interfaces, firewall, VPN — your core workflows)
3. If stable, deploy to production and **don't auto-update**
4. When you need to upgrade, repeat the test-then-deploy cycle

This gives you reproducibility — you know exactly which build you're running, and you control when to move forward.

> If you're just learning or running a homelab, the rolling release is perfectly fine. Many production users run rolling too — VyOS rolling is more stable than most vendors' "stable".

## Bare Metal / VM Installation

1. Boot from ISO
2. Login: `vyos` / `vyos`
3. Run installer:

```bash
install image
```

4. Follow prompts — wipe disk, set root password, set GRUB password (optional)
5. Reboot

Proxmox tip: use **host** CPU type, VirtIO NICs, discard/SSD emulation on.

```bash
# Proxmox VM create example
qm create 100 \
  --name vyos \
  --memory 4096 \
  --cores 2 \
  --net0 virtio,bridge=vmbr0 \
  --net1 virtio,bridge=vmbr1 \
  --scsihw virtio-scsi-pci \
  --virtio0 local-lvm:32,ssd=1,discard=on
```

## Cloud / VPS Deployment

Most VPS providers support custom ISOs or have VyOS images:

### Vultr
Upload custom ISO, or use their VyOS image (if available). Minimum $6/month instance.

### Hetzner Cloud
Use the rescue system to bootstrap:

```bash
# In Hetzner rescue mode
wget https://downloads.vyos.io/rolling/current/vyos-1.5-rolling-latest.iso
qemu-system-x86_64 -cdrom vyos-1.5-rolling-latest.iso \
  -drive file=/dev/sda,format=raw -m 4096 -boot d -nographic
```

### Generic KVM VPS
Mount ISO via provider panel, boot, `install image`.

## First Boot Checklist

```bash
# 1. Enter config mode
configure

# 2. Set hostname
set system host-name vyos-gw

# 3. Set timezone
set system time-zone Asia/Jakarta

# 4. Add a user (don't rely on vyos/vyos!)
set system login user admin authentication plaintext-password 'YourPassword'
set system login user admin full-name 'Administrator'

# 5. Enable SSH on LAN
set service ssh port 22
set service ssh listen-address 192.168.1.1

# 6. Commit and save
commit
save
```

## Image Customization

You can build custom images with pre-seeded config using `vyos-build`:

```bash
git clone https://github.com/vyos/vyos-build
cd vyos-build
sudo ./build-vyos-image --debian-mirror http://deb.debian.org/debian \
  --custom-packages vyos-1x-smoketest
```

Custom config can be injected via `config.boot.default` in the ISO root.

## Next

[Basic Configuration →](../basic-configuration)
