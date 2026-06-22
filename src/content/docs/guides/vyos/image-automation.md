---
title: Automating VyOS Image Builds
description: Build custom VyOS ISOs with extra packages, automated monthly rebuilds, and cron-driven image pipelines for repeatable use.
sidebar:
  order: 9
---

# Automating VyOS Image Builds

The default VyOS ISO is minimal — no `git`, no `nano`, no extra tooling. Building your own image lets you bake in packages, set defaults, and automate monthly rebuilds so you're always on the latest rolling release.

Based on [brav0charlie's automation](https://web.archive.org/web/20240812142633/https://blog.billclark.io/how-i-automate-building-vyos-images) (original blog offline, preserved via Wayback Machine). Updated for current `vyos-build` tooling.

## Why Build Your Own?

| Use case | Package |
|----------|---------|
| Git backup hook | `git` |
| Text editing on-router | `nano` |
| DNS troubleshooting | `dnsutils` (dig, nslookup) |
| Monitoring | `prometheus-node-exporter` |
| Better `cat`/syntax highlighting | `bat` |
| Network debugging | `tcpdump`, `iperf3` |
| Container support | Podman deps |

## Prerequisites

- Docker (for building)
- ~20 GB free disk space
- Git

```bash
# Install Docker if needed
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

## Clone vyos-build

```bash
git clone -b current --single-branch \
  git@github.com:vyos/vyos-build.git
cd vyos-build
```

## Build Scripts

Two scripts: one to launch the Docker container, one that runs inside it.

### `autobuild.sh` — Docker Launcher

```bash
#!/bin/bash
# autobuild.sh — Pull & start vyos-build container

BUILD_BRANCH="current"
PROJECT_DIR="/home/billc/Projects/vyos-build"   # <-- change
HOME_DIR="/home/billc"                            # <-- change
ISO_DEST="/home/billc/vyos-iso"                   # <-- change

mkdir -p "$ISO_DEST"

cd "$PROJECT_DIR"
/usr/bin/git pull

/usr/bin/docker pull vyos/vyos-build:$BUILD_BRANCH && \
  /usr/bin/docker run --rm -t \
    -v "$PROJECT_DIR":/vyos \
    -v "$HOME_DIR/.gitconfig":/etc/gitconfig \
    -v "$HOME_DIR/.bashrc":/home/vyos_bld/.bashrc \
    -w /vyos --privileged \
    --sysctl net.ipv6.conf.lo.disable_ipv6=0 \
    -e GOSU_UID=$(id -u) -e GOSU_GID=$(id -g) \
    vyos/vyos-build:$BUILD_BRANCH \
    bash ./isobuild.sh
```

### `isobuild.sh` — Image Builder (Runs Inside Container)

```bash
#!/bin/bash
# isobuild.sh — Build custom VyOS ISO with extra packages

BUILD_BY="36345117+brav0charlie@users.noreply.github.com"
BUILD_TYPE="release"
VERSION="$(TZ='UTC' date +%Y.%m.%d)-latest"
ARCH="amd64"
BUILD_COMMENT="Custom: git, nano, dnsutils, bat, prometheus-node-exporter"

# Custom packages — add/remove as needed
PKG1="bat"
PKG2="dnsutils"
PKG3="git"
PKG4="nano"
PKG5="prometheus-node-exporter"

ISO_SOURCE="./build/vyos-*-$ARCH.iso"

# Build
sudo ./build-vyos-image \
    --build-by "$BUILD_BY" \
    --build-type "$BUILD_TYPE" \
    --version "$VERSION" \
    --architecture "$ARCH" \
    --custom-package "$PKG1" \
    --custom-package "$PKG2" \
    --custom-package "$PKG3" \
    --custom-package "$PKG4" \
    --custom-package "$PKG5" \
    --build-comment "$BUILD_COMMENT" \
    iso

# Copy ISO to destination
sudo mv $ISO_SOURCE ./vyos-$VERSION-$ARCH.iso
```

## Building

```bash
cd vyos-build
cp ~/scripts/autobuild.sh ~/scripts/isobuild.sh ./
chmod +x autobuild.sh isobuild.sh
./autobuild.sh
```

Build takes 10-20 minutes on a modern CPU (i7 6700K: ~12 min).

The ISO lands in `vyos-build/vyos-YYYY.MM.DD-latest-amd64.iso`.

## Adding More Packages

Add as many `PKG<N>` variables as needed, then add corresponding `--custom-package` lines:

```bash
PKG6="tcpdump"
PKG7="iperf3"
PKG8="mtr-tiny"
# ...
    --custom-package "$PKG6" \
    --custom-package "$PKG7" \
    --custom-package "$PKG8" \
```

## Cron: Monthly Rebuilds

Schedule automatic rebuilds to stay current:

```bash
# crontab -e
# Run 5am on the 1st of each month
0 5 1 * * /path/to/autobuild.sh > /dev/null 2>&1
```

The `git pull` in `autobuild.sh` ensures you always build against the latest `vyos-build`.

## Deploying to Your Router

### Via SCP (Manual)

```bash
scp vyos-2026.06.14-latest-amd64.iso admin@192.168.1.1:/tmp/

# On the router
add system image /tmp/vyos-2026.06.14-latest-amd64.iso
# Reboot to apply
reboot
```

### Via HTTP (Automated)

Serve ISOs from a web server and pull from the router:

```bash
# Build server: copy ISO to web root
cp vyos-*.iso /var/www/html/vyos/

# VyOS router
add system image https://iso.internal/vyos/vyos-2026.06.14-latest-amd64.iso
```

### Verify After Upgrade

```bash
show version
show system image
```

Old images aren't deleted — you can roll back:

```bash
show system image
set system image default-boot <old-image-name>
reboot
```

## Pre-Seeding Config

Bake a default config into the ISO for zero-touch deployment:

```bash
# In vyos-build directory, before building:
# Create config.boot.default — will be loaded on first boot

cat > config.boot.default << 'EOF'
system {
    host-name vyos-template
    time-zone Asia/Jakarta
    login {
        user admin {
            authentication {
                plaintext-password changeme
            }
            full-name "Administrator"
        }
    }
}
interfaces {
    ethernet eth0 {
        address dhcp
    }
}
service {
    ssh {
        port 22
        listen-address 0.0.0.0
    }
}
EOF

# Build as normal — ISO will auto-apply this config
```

**⚠️** Default passwords in configs are a security risk. Change immediately on first boot.

## GitHub Actions (CI/CD Pipeline)

For the truly automated — build ISOs via GitHub Actions on a schedule:

```yaml
# .github/workflows/build-vyos.yml
name: Build VyOS ISO

on:
  schedule:
    - cron: '0 5 1 * *'   # 1st of every month
  workflow_dispatch:        # Manual trigger

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          repository: vyos/vyos-build
          ref: current

      - name: Build ISO
        run: |
          docker run --rm --privileged \
            -v $(pwd):/vyos -w /vyos \
            vyos/vyos-build:current \
            sudo ./build-vyos-image \
              --build-type release \
              --version "$(date +%Y.%m.%d)" \
              --custom-package git \
              --custom-package nano \
              iso

      - name: Upload ISO
        uses: actions/upload-artifact@v4
        with:
          name: vyos-iso
          path: build/*.iso
```

The artifact is downloadable from the Actions tab. For full automation, add a step to upload to your server via SCP/rsync.

## Summary

| What | How |
|------|-----|
| Build once | `./autobuild.sh` |
| Build monthly | Cron job |
| Packages to include | `git`, `nano`, `dnsutils`, `tcpdump` |
| Deploy | `add system image <iso>` |
| Rollback | `set system image default-boot <old>` |
| Zero-touch | `config.boot.default` in ISO root |
| CI/CD | GitHub Actions scheduled workflow |
