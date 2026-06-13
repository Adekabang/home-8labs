---
title: Syslog to Graylog
description: Centralized logging for VyOS — set up Graylog with Docker, configure syslog forwarding, and build dashboards for firewall and routing events.
---

# VyOS Syslog to Graylog

Ship VyOS logs to Graylog for centralized search, alerting, and dashboards. This guide covers Graylog setup via Docker, VyOS syslog configuration, and log parsing with Grok extractors.

Based on [brav0charlie's guide](https://web.archive.org/web/20240810210425/https://brav0charlie.hashnode.dev/sending-vyos-syslog-to-graylog) (original blog offline, preserved via Wayback Machine). Updated for Graylog 6.x and VyOS 1.4+.

## Architecture

```
┌──────────┐   syslog UDP:514   ┌─────────────────────────┐
│  VyOS    │ ──────────────────▶│  Graylog Server          │
│  Router  │                    │  Docker Host             │
└──────────┘                    │  ┌───────────────────┐  │
                                │  │ graylog:6         │  │
                                │  │ opensearch:2      │  │
                                │  │ datanode (built-in)│  │
                                │  └───────────────────┘  │
                                │  Web UI: :9000          │
                                └─────────────────────────┘
```

## Prerequisites

- Linux server with Docker (Ubuntu 24.04 recommended)
- 4 GB RAM, 2 vCPUs, 100+ GB storage (for log retention)
- VyOS router with firewall allowing syslog traffic

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out/in or newgrp docker
```

## Graylog Setup (Modern — Graylog 6.x)

Graylog 6.x uses **DataNode** (built-in, replaces MongoDB) and **OpenSearch** (replaces Elasticsearch). Much simpler than older versions.

### docker-compose.yml

```yaml
# docker-compose.yml — Graylog 6.x + OpenSearch
# Create: mkdir ~/graylog && cd ~/graylog

services:
  opensearch:
    image: opensearchproject/opensearch:2
    container_name: opensearch
    environment:
      - discovery.type=single-node
      - "OPENSEARCH_JAVA_OPTS=-Xms1g -Xmx1g"
      - DISABLE_SECURITY_PLUGIN=true
      - DISABLE_INSTALL_DEMO_CONFIG=true
    volumes:
      - opensearch_data:/usr/share/opensearch/data
    ports:
      - 9200:9200
    restart: unless-stopped

  graylog:
    image: graylog/graylog:6.1
    container_name: graylog
    depends_on:
      - opensearch
    environment:
      GRAYLOG_PASSWORD_SECRET: ${GRAYLOG_PASSWORD_SECRET}
      GRAYLOG_ROOT_PASSWORD_SHA2: ${GRAYLOG_ROOT_PASSWORD_SHA2}
      GRAYLOG_HTTP_BIND_ADDRESS: 0.0.0.0:9000
      GRAYLOG_HTTP_EXTERNAL_URI: http://${GRAYLOG_HOST}:9000/
      GRAYLOG_ELASTICSEARCH_HOSTS: http://opensearch:9200
      GRAYLOG_MONGODB_URI: ""   # DataNode replaces MongoDB in 6.x
    entrypoint: /usr/bin/tini -- wait-for-it opensearch:9200 -- /docker-entrypoint.sh
    volumes:
      - graylog_data:/usr/share/graylog/data
    ports:
      - 9000:9000       # Web UI
      - 514:1514/udp    # Syslog UDP
      - 514:1514/tcp    # Syslog TCP
      - 12201:12201/udp # GELF
    restart: unless-stopped

volumes:
  opensearch_data:
  graylog_data:
```

### .env File

Create `.env` alongside `docker-compose.yml`:

```bash
# Generate password secret
GRAYLOG_PASSWORD_SECRET=$(pwgen -N 1 -s 96 2>/dev/null || openssl rand -hex 48)

# Generate root password hash
GRAYLOG_ROOT_PASSWORD_SHA2=$(echo -n "YourAdminPassword" | sha256sum | cut -d' ' -f1)

# Your server's IP or hostname
GRAYLOG_HOST=192.168.1.100
```

Or inline:

```bash
cat > .env << 'EOF'
GRAYLOG_PASSWORD_SECRET=replace-with-pwgen-output
GRAYLOG_ROOT_PASSWORD_SHA2=replace-with-sha256-of-password
GRAYLOG_HOST=192.168.1.100
EOF
```

### Start Graylog

```bash
cd ~/graylog
docker compose up -d

# Watch logs until ready
docker logs -f graylog
# Look for: "Graylog server up and running."
```

Access: `http://192.168.1.100:9000` — login `admin` / your chosen password.

### Legacy Setup (Graylog 4.x — if needed)

<details>
<summary>Older docker-compose with MongoDB + Elasticsearch</summary>

```yaml
services:
  mongo:
    image: mongo:6
    volumes:
      - mongo_data:/data/db
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.25
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - es_data:/usr/share/elasticsearch/data
  graylog:
    image: graylog/graylog:5.2
    environment:
      GRAYLOG_PASSWORD_SECRET: ${GRAYLOG_PASSWORD_SECRET}
      GRAYLOG_ROOT_PASSWORD_SHA2: ${GRAYLOG_ROOT_PASSWORD_SHA2}
      GRAYLOG_HTTP_EXTERNAL_URI: http://${GRAYLOG_HOST}:9000/
    depends_on:
      - mongo
      - elasticsearch
    ports:
      - 9000:9000
      - 514:1514/udp
    volumes:
      - graylog_data:/usr/share/graylog/data
volumes:
  mongo_data:
  es_data:
  graylog_data:
```

</details>

## Configure Syslog Input

### 1. Create Syslog UDP Input

1. Login to Graylog → **System** → **Inputs**
2. Select **Syslog UDP** from dropdown → **Launch new input**
3. Configure:
   - Title: `VyOS Syslog`
   - Port: `1514` (container port; mapped from 514 on host)
   - Bind address: `0.0.0.0`
   - ✅ Store full message
4. Click **Save** → **Start input**

> **Why port 1514?** Graylog runs non-root, can't bind to ports <1024. Docker maps host 514 → container 1514.

## VyOS → Graylog: Syslog Forwarding

### VyOS 1.4+ Configuration

```bash
configure

# Global syslog settings
set system syslog global facility all level info
set system syslog global facility protocols level debug

# Forward to Graylog — replace IP with your Graylog server
set system syslog host 192.168.1.100 facility all level info
set system syslog host 192.168.1.100 facility protocols level debug
set system syslog host 192.168.1.100 port 514
set system syslog host 192.168.1.100 protocol udp

# Octet-counted framing (RFC 6587) — recommended
set system syslog host 192.168.1.100 format octet-counted

# Source address — use loopback IP for consistent log origin
set system syslog host 192.168.1.100 source-address 10.255.255.1

commit
save
```

### Multiple VyOS Routers

Each router uses its own loopback IP as source — Graylog can differentiate:

```bash
# Router A (10.255.255.1)
set system syslog host 192.168.1.100 source-address 10.255.255.1

# Router B (10.255.255.2)
set system syslog host 192.168.1.100 source-address 10.255.255.2
```

## Firewall: Allow Syslog

If your Graylog server is on a different subnet, ensure the firewall allows it:

```bash
# From router to Graylog server
set firewall ipv4 name LOCAL-to-LAN rule 10 action accept
set firewall ipv4 name LOCAL-to-LAN rule 10 destination address 192.168.1.100
set firewall ipv4 name LOCAL-to-LAN rule 10 destination port 514
set firewall ipv4 name LOCAL-to-LAN rule 10 protocol udp
```

## Grok Extractors for VyOS

VyOS firewall logs have a specific format. Extractors parse this into searchable fields.

### Manual Setup

1. **System** → **Inputs** → your Syslog UDP input → **Manage extractors**
2. Click **Actions** → **Import extractors**
3. Paste the JSON below or use the content pack

### Content Pack (Recommended)

[brav0charlie/graylog-vyos](https://github.com/brav0charlie/graylog-vyos) provides a pre-built content pack with extractors, pipelines, and GeoIP lookup.

> **⚠️ VyOS 1.4+ Note:** The original content pack was built for VyOS 1.3. VyOS 1.4 changed firewall rule naming (zone-based with action suffix). You may need to adjust grok patterns. See workaround below.

```bash
# Download content pack
git clone https://github.com/brav0charlie/graylog-vyos.git
```

Install: **System** → **Content Packs** → **Upload** → select `.json` file.

### VyOS 1.4+ Firewall Log Format Fix

VyOS 1.4 zone-based firewall logs look like:

```
[LAN-to-WAN-10-A] IN=eth1 OUT=eth0 ...
```

Where `10` is the rule number and `A` = Accept, `D` = Drop, `R` = Reject.

Custom grok pattern for the new format:

```
# Add to System → Grok Patterns
SYSLOG_HEADER_VYOS %{DATA}\[%{DATA:source_zone}-%{DATA:dest_zone}-%{INT:rule_number}-%{DATA:rule_action_raw}\]
```

Pipeline rule to translate actions:

```
rule "Translate VyOS Firewall Action"
when has_field("rule_action_raw")
then
  let action_map = {
    "A": "Accept",
    "D": "Drop", 
    "R": "Reject"
  };
  set_field("rule_action", action_map[to_string($message.rule_action_raw)]));
end
```

## Verify Logs are Flowing

### On Graylog

1. Go to **Search** page
2. You should see messages from your VyOS router(s)
3. Filter: `source:10.255.255.1` (your router's source IP)

### On VyOS

```bash
# Check syslog status
show log syslog

# Test connectivity to Graylog
nc -zu 192.168.1.100 514 && echo "UDP 514 reachable"

# Force a log event
logger "VyOS test message to Graylog"
```

## Dashboards

Once logs are flowing, create a dashboard:

1. **Dashboards** → **Create new dashboard**
2. Add widgets:
   - Firewall drops by source/destination zone (bar chart)
   - Top blocked source IPs (table)
   - Traffic accepted vs dropped over time (line chart)
   - SSH login attempts (counter)
   - BGP session state changes (event list)

### Quick Start Search Queries

```
# Firewall drops
rule_action:Drop

# SSH failed logins  
sshd AND Failed

# BGP state changes
bgp AND state

# Interface state changes
interface AND (up OR down)

# Commit events
commit AND user

# All logs from one router
source:10.255.255.1
```

## Retention & Sizing

Configure index rotation in Graylog to manage disk:

**System** → **Indices** → default index set → **Edit**

| Setting | Recommended |
|---------|-------------|
| Rotation strategy | Index time |
| Rotation period | P1D (daily) |
| Retention | Delete after 30 days |
| Shards | 1 (single node) |
| Replicas | 0 (single node) |

Storage sizing: ~500 MB/day for a busy home router, ~2-5 GB/day for production with debug logging.

## Troubleshooting

### No logs appearing

```bash
# Check VyOS syslog destination
show system syslog

# Check network — can router reach Graylog?
ping 192.168.1.100

# Check Graylog input is running
# System → Inputs → should show "running" (green)

# Check Docker port mapping
docker ps | grep graylog
```

### Graylog won't start

```bash
# Check logs
docker logs graylog --tail 50

# Common issues:
# - Wrong GRAYLOG_PASSWORD_SECRET (must be exactly 96 chars for pwgen)
# - OpenSearch not ready — wait 30s
# - Port 9000 already in use
```

### VyOS 1.4+ firewall logs not parsing

The 1.4 firewall log format changed. Old extractors won't match. Either:
1. Use the custom grok pattern above
2. Wait for updated content pack from brav0charlie/graylog-vyos
3. Disable zone-based naming and use interface-based rules

## Summary

| Step | What |
|------|------|
| 1. Docker host | `docker compose up -d` with Graylog 6.x |
| 2. Graylog input | Syslog UDP on port 1514 (mapped from 514) |
| 3. VyOS config | `set system syslog host <ip> port 514` |
| 4. Content pack | Extractors + pipelines from graylog-vyos |
| 5. Verify | Search page shows VyOS messages |
