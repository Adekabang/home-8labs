---
title: High Availability
description: VRRP (Virtual Router Redundancy Protocol), configuration sync, and stateful failover with VyOS.
sidebar:
  order: 7
---

# High Availability with VRRP

> **Version key:** <sup>🟢</sup> = 1.3+ · <sup>🟡</sup> = 1.4+ · <sup>🟣</sup> = 1.5+

VRRP (Virtual Router Redundancy Protocol) lets two or more VyOS routers share a **virtual IP**. If the master fails, a backup takes over — clients don't notice.

## Architecture

```
     ┌─────────────────────────────┐
     │     Virtual IP: .1          │
     │  ┌─────────┐  ┌─────────┐   │
     │  │ Router A │  │ Router B │   │
     │  │ MASTER   │  │ BACKUP   │   │
     │  │ .2       │  │ .3       │   │
     │  └────┬─────┘  └────┬─────┘   │
     │       │             │         │
     └───────┼─────────────┼─────────┘
             │   SWITCH    │
       ┌─────┴─────────────┴─────┐
       │     192.168.1.0/24      │
       │   Gateway: 192.168.1.1  │  ← Virtual IP
       └─────────────────────────┘
```

## Basic VRRP <sup>🟢 1.3+</sup>

**Router A (master):**

```bash
set interfaces ethernet eth1 address 192.168.1.2/24
set interfaces ethernet eth1 vrrp vrrp-group 1
set high-availability vrrp group LAN interface eth1
set high-availability vrrp group LAN vrid 10
set high-availability vrrp group LAN virtual-address 192.168.1.1/24
set high-availability vrrp group LAN priority 200           # higher = master
set high-availability vrrp group LAN preempt true
set high-availability vrrp group LAN preempt-delay 60
set high-availability vrrp group LAN hello-interval 1
set high-availability vrrp group LAN authentication type plaintext-password
set high-availability vrrp group LAN authentication plaintext-password 'vrrp-secret'
```

**Router B (backup):**

```bash
set interfaces ethernet eth1 address 192.168.1.3/24
set interfaces ethernet eth1 vrrp vrrp-group 1
set high-availability vrrp group LAN interface eth1
set high-availability vrrp group LAN vrid 10
set high-availability vrrp group LAN virtual-address 192.168.1.1/24
set high-availability vrrp group LAN priority 100           # lower = backup
set high-availability vrrp group LAN authentication type plaintext-password
set high-availability vrrp group LAN authentication plaintext-password 'vrrp-secret'
```

### Multiple VRIDs (Load Sharing)

Split traffic across both routers for active-active:

```bash
# Router A — master for vrid 10, backup for vrid 20
set high-availability vrrp group LAN-A interface eth1
set high-availability vrrp group LAN-A vrid 10
set high-availability vrrp group LAN-A virtual-address 192.168.1.1/24
set high-availability vrrp group LAN-A priority 200

set high-availability vrrp group LAN-B interface eth1
set high-availability vrrp group LAN-B vrid 20
set high-availability vrrp group LAN-B virtual-address 192.168.1.2/24
set high-availability vrrp group LAN-B priority 100

# Router B — master for vrid 20, backup for vrid 10
# Set priorities reversed
```

LAN clients use `.1` or `.2` as gateway — split them via DHCP or manual config.

## WAN Failover (Dual WAN)

If each router has its own WAN:

```bash
# On both routers — SNAT to their respective WAN IPs
# Use `translation address` instead of masquerade

# Router A
set nat source rule 100 outbound-interface name eth0
set nat source rule 100 source address 192.168.1.0/24
set nat source rule 100 translation address 203.0.113.10

# Router B
set nat source rule 100 outbound-interface name eth0
set nat source rule 100 source address 192.168.1.0/24
set nat source rule 100 translation address 203.0.113.11
```

## Configuration Sync

VRRP handles IP failover, but you need config sync too. Options:

### Manual Sync (simple)

```bash
# On master, after commit:
save
scp /config/config.boot backup@192.168.1.3:/config/config.boot
ssh backup@192.168.1.3 'load /config/config.boot; commit; save'
```

### Scripted Sync

Create `/config/scripts/sync-config.sh`:

```bash
#!/bin/bash
BACKUP="192.168.1.3"
REMOTE_USER="vyos"
CONFIG="/config/config.boot"

rsync -avz $CONFIG $REMOTE_USER@$BACKUP:/config/config.boot.tmp
ssh $REMOTE_USER@$BACKUP "source /opt/vyatta/etc/functions/script-template; \
  configure; load /config/config.boot.tmp; \
  set high-availability vrrp group LAN priority 100; \
  commit; save; exit"
```

### Cluster Config (VyOS 1.4+) <sup>🟡</sup>

```bash
# Experimental: config-sync feature
set high-availability config-sync peer 192.168.1.3
set high-availability config-sync sync-direction master-to-backup
set high-availability config-sync sync-on-commit
```

## Stateful Failover (Connection Tracking Sync) <sup>🟡 1.4+</sup>

For seamless failover of active connections (NAT, firewall states):

```bash
# On master — sync state table to backup
set high-availability vrrp group LAN sync-group LAN-SYNC
set high-availability vrrp sync-group LAN-SYNC member LAN
set high-availability vrrp sync-group LAN-SYNC conntrack-sync interface eth1

# On backup — receive
set high-availability vrrp group LAN sync-group LAN-SYNC
set high-availability vrrp sync-group LAN-SYNC member LAN
set high-availability vrrp sync-group LAN-SYNC conntrack-sync interface eth1

# Note: Both routers need a dedicated sync link (or use LAN).
# The sync interface carries state table traffic.
```

## Monitoring & Health Checks <sup>🟡 1.4+</sup>

### Track Interface Status

Drop priority if WAN goes down:

```bash
set high-availability vrrp group LAN track interface eth0
set high-availability vrrp group LAN track interface eth0 priority-cost 150
# If eth0 goes down, priority drops by 150 → backup takes over
```

### Script-based Health Check

```bash
# Health check script
set high-availability vrrp group LAN health-check script /config/scripts/health-check.sh
set high-availability vrrp group LAN health-check interval 5

# /config/scripts/health-check.sh:
```

```bash
#!/bin/bash
# Exit 0 = healthy, exit 1 = unhealthy (trigger failover)
ping -c 1 -W 2 8.8.8.8 > /dev/null 2>&1
exit $?
```

## Verify

```bash
# VRRP status
show high-availability vrrp summary
show high-availability vrrp group LAN
show high-availability vrrp statistics

# Who is master?
show high-availability vrrp group LAN | grep -i state

# Conntrack sync status
show high-availability vrrp sync-group

# Interface tracking
show high-availability vrrp track
```

## Complete HA Config (Reference)

Two routers, shared LAN, dual WAN, config sync:

```
Router A (192.168.1.2)          Router B (192.168.1.3)
  WAN: 203.0.113.10               WAN: 203.0.113.11
  Priority: 200                   Priority: 100
  Virtual IP: 192.168.1.1         Virtual IP: 192.168.1.1
```

**Both routers share the same base config** except:
- Real IP on eth1 (.2 vs .3)
- VRRP priority (200 vs 100)
- SNAT WAN IP

Template approach: maintain ONE config, deploy with `sed` to customize per-router values.

## Pitfalls

- **Split brain**: Both routers master → both respond to virtual IP ARP. Caused by: no multicast between them, mismatched VRID, authentication mismatch.
- **No state sync = broken connections** during failover. NAT tables aren't shared by default — enable conntrack-sync.
- **STP convergence** on switch ports can delay failover. Use PortFast/edge ports.
- **WAN failover ≠ link redundancy** unless you have BGP with your own IP space. Two different WAN IPs mean two different NAT IPs.
