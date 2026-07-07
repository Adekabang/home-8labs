---
title: OPNsense
description: OPNsense firewall guides — extending with community packages, building custom ports, and advanced configurations.
sidebar:
  order: 0
---

# OPNsense

OPNsense is a FreeBSD-based firewall and routing platform. Out of the box it ships about 800 packages. But sometimes you need more: a reverse proxy, monitoring stack, DNS ad blocker, or custom software running on that always-on firewall box.

Two ways to extend OPNsense beyond stock packages:

1. **[Community Repository](./community-repo)** — the easy way. Install pre-built community packages like AdGuard Home, Grafana, Caddy, Traefik, and more via mimugmail's community repo.

2. **[Building Custom Packages](./building-packages)** — the advanced way. Use OPNsense's official `tools.git` to build your own packages from ports, for when you need something not in any repo.

## Why not just install FreeBSD packages?

OPNsense is based on HardenedBSD, not vanilla FreeBSD. Installing FreeBSD binary packages will break things. Even HardenedBSD packages have compatibility issues. The only safe approaches are:

- **Community repo** (mimugmail) — pre-built, tested, OpenSSL-only
- **Build from ports** using OPNsense's own toolchain — proper, reproducible
- **OPNsense plugins** — first-party, maintained by the project

The old Poudriere-based approach documented on the forum (2021) no longer works on modern OPNsense versions. The OPNsense lead developer has confirmed they don't use Poudriere internally.

## Current versions

| Component | Version |
|-----------|---------|
| OPNsense | 26.x (rolling) |
| FreeBSD base | 14.x |
| Package manager | pkg 1.17+ |
