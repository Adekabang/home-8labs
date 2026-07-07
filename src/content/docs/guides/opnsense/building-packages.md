---
title: Building Custom OPNsense Packages
description: Build your own OPNsense packages from ports using the official tools.git repository on a FreeBSD 14 build machine.
sidebar:
  order: 2
---

# Building Custom OPNsense Packages

When you need software that isn't in the official repo or community repo, you can build it yourself. OPNsense provides `tools.git`, the same toolkit they use internally for building packages, ports, and release images.

> **Note:** This guide is for OPNsense 26.x (FreeBSD 14.x). The old Poudriere approach documented on the OPNsense forum (2021, for OPNsense 21.1) no longer works. The OPNsense lead developer has confirmed they don't use Poudriere internally.

## Why Not Poudriere?

The forum tutorial "Making OPNsense more useful with custom-built packages" by kraileth (February 2021) was an excellent resource for its time. It explained how to use Poudriere with OPNsense 21.1 (FreeBSD 12.1 / HardenedBSD 12.1).

However, things changed:

- **pkg 1.16+ broke Poudriere compatibility.** Builds fail at the packaging phase with `pkg-1.16.3.pkg: No such file or directory`.
- **mimugmail confirmed:** "Poudriere currently doesn't work with pkg 1.16, it only works with the build tools from OPNsense itself right now."
- **Franco (OPNsense lead dev) added:** "Changes in pkg 1.17 are a bit destructive... Situations like these are why we do not use poudriere."

The official way is OPNsense's `tools.git`.

## Architecture

```
┌─────────────────────────┐     ┌──────────────────────┐
│  FreeBSD 14 Build VM    │     │   OPNsense Firewall  │
│                         │     │                      │
│  /usr/tools (git)       │     │  pkg repo pointing   │
│  /usr/ports (git)       │──▶──│  to build VM via     │
│  /usr/src (git)         │     │  HTTP or NFS         │
│                         │     │                      │
│  make ports → packages  │     │  pkg install <pkg>   │
└─────────────────────────┘     └──────────────────────┘
```

You build on a separate machine (or VM), never directly on your production firewall. The build machine needs:

- FreeBSD 14.3-RELEASE (amd64)
- At least 40 GB disk
- At least 8 GB RAM
- Root access

## Setting Up the Build Machine

Install FreeBSD 14.3-RELEASE on a VM or spare machine. Then:

```bash
# Install git
pkg install git

# Clone the tools repository
cd /usr
git clone https://github.com/opnsense/tools
cd tools
```

### Update All Repositories

This pulls `src.git`, `ports.git`, `core.git`, and `plugins.git`:

```bash
make update
```

To use a specific OPNsense version (e.g., 26.7):

```bash
make update VERSION=26.7
```

> **Alternative directory:** If you don't want to use `/usr`, set `ROOTDIR`:
>
> ```bash
> mkdir -p /tmp/opnsense
> cd /tmp/opnsense
> git clone https://github.com/opnsense/tools
> cd tools
> env ROOTDIR=/tmp/opnsense make update
> ```

## Building Individual Packages

The tools support targeted rebuilds:

```bash
# Build a single port
make ports-curl

# Build multiple ports
make ports-curl,nginx,git

# Build a plugin
make plugins-os-caddy

# Build multiple plugins
make plugins-os-caddy,os-traefik
```

For a full ports build (all packages):

```bash
make ports
```

> **Warning:** A full ports build takes hours and requires significant disk space. For a few custom packages, use targeted builds.

### Build Options

Control ports build behavior with `PORTSENV`:

| Option | Default | Purpose |
|--------|---------|---------|
| `BATCH=no` | `yes` | Drop to shell after each build failure for debugging |
| `DEPEND=no` | `yes` | Don't rebuild dependent plugins/core |
| `DISTFILES=no` | `yes` | Don't use prefetched distfiles |
| `MISMATCH=no` | `yes` | Don't rebuild packages with version mismatch |
| `PRUNE=no` | `yes` | Skip ports integrity check before rebuild |

Example:

```bash
make ports-curl PORTSENV="DEPEND=no PRUNE=no"
```

You can also override the ports list:

```bash
make ports PORTSLIST="security/openssl www/nginx"
```

## Adding Custom Ports

The OPNsense ports tree is at `/usr/ports` (cloned from `opnsense/ports.git`). It's a HardenedBSD ports tree with OPNsense-specific patches.

To add a port not already in the tree:

```bash
cd /usr/ports
# Find the port category
ls -d */your-package-name
```

If the port doesn't exist in the OPNsense ports tree, you need to bring it in from FreeBSD ports. This is the `make skim` workflow:

```bash
# Review and copy upstream changes for used ports
make skim-used

# Copy unused upstream changes
make skim-unused

# Do both
make skim
```

For specific port syncing between branches:

```bash
make sync-category/port
```

## Custom Package Lists

Create a package list file for bulk builds:

```bash
# Create a list of packages to build
cat > /usr/tools/my-packages.txt << 'EOF'
www/nginx
net/tailscale
sysutils/htop
EOF

# Build from the list
make ports PORTSLIST_FILE=my-packages.txt
```

## Where Build Output Goes

Built packages are stored under the sets directory:

```bash
make print-SETSDIR
```

The packages are organized as a pkg repository, ready to be served.

## Serving Your Custom Repository

### Option 1: HTTP Server on Build Machine

Install a lightweight web server on the build machine:

```bash
pkg install nginx
```

Configure it to serve the packages directory. Then on your OPNsense box, add a repo config:

```bash
cat > /usr/local/etc/pkg/repos/custom.conf << 'EOF'
Custom: {
  url: "http://<build-machine-ip>/packages/${ABI}",
  priority: 10,
  enabled: yes
}
EOF

pkg update
```

### Option 2: Copy Packages Manually

For one-off installs, copy the `.txz` file and install directly:

```bash
# On OPNsense
pkg add /path/to/package-version.txz
```

## Building for a Specific OPNsense Version

The tools use git tags to determine the target version. To build for a specific release:

```bash
# Show current version info
make info

# Build for version 26.7
make ports VERSION=26.7
```

## Additional Build Commands

```bash
# Build the base system (userland + bootloader)
make base

# Build kernel and modules
make kernel

# Build plugins
make plugins

# Build core package
make core

# Create DVD image (not needed for custom packages)
make dvd

# Run regression tests
make test

# Audit packages for vulnerabilities
make audit
```

## Troubleshooting

### "Unsupported system version"

If the ports tree complains about your FreeBSD version:

```bash
echo 'ALLOW_UNSUPPORTED_SYSTEM=yes' >> /etc/make.conf
```

### Build fails for a specific port

Try with developer mode:

```bash
make ports-<broken-package> PORTSENV="BATCH=no"
```

This drops you into a shell inside the build jail after a failure, letting you inspect the build environment.

### Package version mismatch

Force rebuild of mismatched packages:

```bash
make ports PORTSENV="MISMATCH=no"
```

## Reference

- [opnsense/tools on GitHub](https://github.com/opnsense/tools) — official build toolkit
- [opnsense/ports on GitHub](https://github.com/opnsense/ports) — OPNsense ports tree
- [OPNsense Community Repository](https://www.routerperformance.net/opnsense-repo/) — pre-built community packages

Based on research from the [OPNsense forum tutorial](https://forum.opnsense.org/index.php?topic=21739.0) by kraileth (2021, now outdated) and validated against current OPNsense 26.x tooling (July 2026).
