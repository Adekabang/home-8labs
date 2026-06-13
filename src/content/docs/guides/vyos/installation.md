---
title: VyOS Installation
description: Installing VyOS on bare metal, VMs, and cloud VPS — ISO download, initial setup, and image customization.
---

# Installing VyOS

VyOS runs on any x86_64 system. Minimum: 2 GB RAM, 8 GB storage, 1 CPU core. For production: 4 GB RAM, 20+ GB storage.

## Download

**LTS (recommended for production):** VyOS 1.4 Sagitta
**Rolling (latest features):** VyOS 1.5 Circinus

Download ISO from [vyos.net/get](https://vyos.io/get/) — free registration required. Nightly builds available for subscribers.

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

[Basic Configuration →](./basic-configuration)
