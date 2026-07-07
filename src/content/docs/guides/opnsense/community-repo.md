---
title: OPNsense Community Repository
description: Install pre-built community packages on OPNsense — AdGuard Home, Grafana, Caddy, Traefik, and more via mimugmail's community repo.
sidebar:
  order: 1
---

# OPNsense Community Repository

The easiest way to add extra software to OPNsense. Maintained by [@mimugmail](https://github.com/mimugmail), this community repo provides pre-built packages and plugins not available in the official OPNsense repository.

## Limitations

The repo maintainer is upfront about what you're getting into:

- **OpenSSL only.** No LibreSSL support. Check your dashboard under System Information → Versions — most installs use OpenSSL by default.
- **Not for production-critical systems.** Packages are tested sporadically, not extensively.
- **No official OPNsense support.** The OPNsense team does not maintain or endorse this repo.
- **Won't work with `/var` in ramdisk.** Services need persistent storage.
- **Limited community support.** Questions may get low response on forums or Reddit.

## Installation (Full Repo)

SSH into your OPNsense and fetch the repo config:

```bash
fetch -o /usr/local/etc/pkg/repos/mimugmail.conf https://www.routerperformance.net/mimugmail.conf
```

Then go to **System → Firmware → Plugins** and check for updates. You'll see new plugins available for installation.

Some packages don't have GUI plugins yet. Install them via CLI:

```bash
pkg install ocserv
```

## Installation (AdGuard Only)

If you only need AdGuard Home and want to avoid conflicts with Zenarmor:

```bash
fetch -o /usr/local/etc/pkg/repos/mimugmail-single.conf https://www.routerperformance.net/mimugmail-single.conf
```

Then **System → Firmware → Plugins** → check for updates.

## Available Plugins

These have GUI integration (install from **System → Firmware → Plugins**):

| Plugin | Package Name | Notes |
|--------|-------------|-------|
| Unifi Controller | `os-unifi-maxit` | Existing gozoinks-script installs should stay as-is |
| InfluxDB | `os-influxdb-maxit` | Time-series database |
| Grafana | `os-grafana-maxit` | Dashboards and monitoring |
| OCServ | `os-ocserv-maxit` | OpenConnect VPN server (Cisco AnyConnect compatible) |
| Elasticsearch | `os-elasticsearch-maxit` | Search and analytics engine |
| Kibana | `os-kibana-maxit` | Elasticsearch visualization |
| AdGuard Home | `os-adguardhome-maxit` | DNS ad blocking; listens on port 3000 |
| CARPcron | `os-carpcron-maxit` | HA cron job auto-sync |
| Speedtest | `os-speedtest-community` | Internet speed test (by mihak09) |
| Traefik | `os-traefik-maxit` | Reverse proxy with auto-TLS |
| Caddy | `os-caddy-maxit` | Reverse proxy with automatic HTTPS |
| Zeek | `os-zeek-maxit` | Network security monitoring |
| Home Assistant | `os-homeassisstant-maxit` | Home automation |
| Unbound Custom Options | — | Extended Unbound DNS configuration |
| OPNarp | — | ARP watch alternative |

### Themes

| Theme | Package Name |
|-------|-------------|
| Solarized | `os-theme-solarized-community` |
| Dracula | `os-theme-dracula-community` |

## Available CLI Packages

Install these via `pkg install`:

| Package | Category |
|---------|----------|
| `apache24` | Web server |
| `cloudflared` | Cloudflare Tunnel |
| `crowdsec` | CrowdSec security engine |
| `ethname` | Ethernet naming tool |
| `grafana7` | Grafana v7 |
| `graylog` | Graylog log management |
| `guacamole` | Apache Guacamole (remote desktop gateway) |
| `influxdb` | InfluxDB time-series DB |
| `mariadb` | MySQL-compatible database |
| `mongodb36` | MongoDB 3.6 |
| `mosquitto` | MQTT broker |
| `ocserv` | OpenConnect server (CLI) |
| `openjdk8` / `openjdk11` | Java runtimes |
| `smokeping` | Network latency monitoring |
| `tailscale` | Tailscale mesh VPN |
| `tomcat9` | Java servlet container |
| `unifi6` | UniFi controller (CLI) |

## Updating

Community packages update alongside OPNsense system updates:

1. **System → Firmware → Updates** — check for updates
2. Updates from all configured repos (official + community) appear together
3. Install as usual

Or via CLI:

```bash
pkg upgrade
```

The repo config sets `priority: 5` (lower than official OPNsense at `priority: 0`), so official packages take precedence and won't be overridden.

## Removing

Delete the repo config and re-check for updates:

```bash
rm /usr/local/etc/pkg/repos/mimugmail.conf
pkg update
```

## Contact & Source

- GitHub: [mimugmail/opn-repo](https://github.com/mimugmail/opn-repo/issues)
- Repo page: [routerperformance.net/opnsense-repo](https://www.routerperformance.net/opnsense-repo/)
- Maintainer: [@mimugmail](https://forum.opnsense.org/index.php?action=profile;u=...) on OPNsense Forum

Package licenses are free for use. Selling these packages is prohibited.
