---
title: Mount Neva Objects S3 with Rclone
description: Mount a Neva Objects S3 bucket as a local filesystem using Rclone and FUSE. Includes systemd auto-mount, VFS caching, and troubleshooting.
sidebar:
  order: 1
---

# Mount Neva Objects S3 with Rclone

General-purpose S3 mount for Neva Objects using Rclone + FUSE. Works as a local filesystem bridge: any app that writes to `/mnt/neva-s3` transparently uploads to your bucket.

## 1. Install Rclone & FUSE3

```bash
# FUSE3 (required for mount)
sudo dnf install fuse3 -y

# Rclone via official install script
sudo -v ; curl https://rclone.org/install.sh | sudo bash
```

For Debian/Ubuntu: replace `dnf` with `apt`.

## 2. Configure Rclone

```bash
mkdir -p ~/.config/rclone
```

**`~/.config/rclone/rclone.conf`** (or `/root/.config/rclone/rclone.conf` for systemd):

```ini
[neva-s3]
type = s3
provider = Other
access_key_id = YOUR_ACCESS_KEY
secret_access_key = YOUR_SECRET_KEY
endpoint = https://s3.nevaobjects.id
force_path_style = true
v2_auth = true
```

> **`v2_auth = true` is mandatory.** Neva Objects routes through a reverse proxy/gateway, and without v2 signing the signature hash breaks, causing 403 errors.

## 3. Create Mount Point

```bash
sudo mkdir -p /mnt/neva-s3
```

## 4. Systemd Service (Auto-Mount on Boot)

**`/etc/systemd/system/rclone-neva-s3.service`**:

```ini
[Unit]
Description=Rclone Mount: Neva Objects S3
After=network-online.target

[Service]
Type=simple
ExecStartPre=/bin/mkdir -p /mnt/neva-s3
ExecStart=/usr/bin/rclone mount neva-s3:YOUR-BUCKET-NAME /mnt/neva-s3 \
  --config /root/.config/rclone/rclone.conf \
  --allow-other \
  --vfs-cache-mode full \
  --vfs-cache-max-size 10G
ExecStop=/usr/bin/fusermount3 -uz /mnt/neva-s3
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

> **`--vfs-cache-mode full`** buffers writes on local disk/memory before uploading. This is what makes apps that need POSIX locking (Borg, SQLite, any tool creating `.lock` files) work: the lock file lives in cache, not on S3 directly.
>
> **`--vfs-cache-max-size 10G`** tunes the cache ceiling to your available disk space. The cache dir defaults to `~/.cache/rclone`.

## 5. Enable & Start

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now rclone-neva-s3.service
sudo systemctl status rclone-neva-s3.service   # should show "active (running)"
```

## 6. Verify

```bash
ls /mnt/neva-s3
echo "hello neva" | sudo tee /mnt/neva-s3/test.txt
cat /mnt/neva-s3/test.txt
```

If `ls` shows your bucket contents and the test file writes successfully, you're done. Any application can now read/write `/mnt/neva-s3` as if it were a local directory: Rclone handles the upload/download in the background.

## Quick Troubleshooting

| Symptom | Fix |
|---|---|
| 403 Forbidden on mount | Verify `v2_auth = true` is set in rclone.conf |
| "Transport endpoint not connected" | `sudo fusermount3 -uz /mnt/neva-s3` then restart the service |
| Mount works but writes are slow | Increase `--vfs-cache-max-size` or use `--vfs-write-back 5m` for batching |
| Permission denied for non-root | `--allow-other` is set; also check `/etc/fuse.conf` has `user_allow_other` uncommented |

## Manual Mount (One-Off, No Systemd)

```bash
rclone mount neva-s3:YOUR-BUCKET-NAME /mnt/neva-s3 \
  --vfs-cache-mode full \
  --daemon
```

The `--daemon` flag backgrounds it. Use `fusermount3 -u /mnt/neva-s3` to unmount.
