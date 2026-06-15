---
title: "Setting Up a Production-Ready VPS from Scratch — Rocky Linux 10 & Ubuntu 26.04"
description: "Step-by-step guide to hardening and deploying a production-ready VPS on Rocky Linux 10 or Ubuntu 26.04 — SSH hardening, firewalld/UFW, Docker, Traefik, Let's Encrypt TLS, load balancing, Watchtower, and uptime monitoring."
date: 2026-06-16
sidebar:
  order: 0
---

# Setting Up a Production-Ready VPS from Scratch — Rocky Linux 10 & Ubuntu 26.04

> Adapted from [Dreams of Code](https://dreamsofcode.io/blog/setting-up-a-production-ready-vps-from-scratch) — dual-OS guide covering both RHEL-family and Debian-family setups.

---

Deploying to the cloud has never been easier. Platform-as-a-Service (PaaS) options like Railway, Fly.io, and Render make going live a breeze. But PaaS isn't perfect for every use case — long-running tasks, heavy data transfer, and predictable billing often push teams toward a **VPS (Virtual Private Server)**.

The perceived difficulty of hardening and configuring a raw VPS scares people off. But is it actually hard? We set out to prove it isn't — with a production-ready stack on both **Rocky Linux 10** and **Ubuntu 26.04 LTS**.

## What "Production-Ready" Means Here

- DNS pointing to the server
- Application deployed and running (Docker)
- HTTPS/TLS with automatic cert provisioning & renewal (Let's Encrypt)
- Hardened SSH — no root login, no password auth
- Firewall blocking unnecessary ports
- High availability — multiple app instances
- Load balancing via reverse proxy
- Automated rolling deployments
- Uptime monitoring with alerts

**Constraints:** No Kubernetes. No Coolify. No Terraform. Simple tooling, minimal domain expertise.

---

## Step 1: Provisioning the VPS

Pick a provider (Hetzner, Hostinger, DigitalOcean, Vultr). We used a **2 vCPU / 8 GB RAM** instance.

During setup via your provider's panel:
1. Select **Rocky Linux 10** or **Ubuntu 26.04 LTS**
2. Set a strong root password
3. Add your SSH public key
4. Disable any "malware scanner" or monitoring agent if you don't need it

Once deployed, test SSH:

```bash
ssh root@<your-server-ip>
```

---

## Step 2: Create a Non-Root User

Working as root is a bad habit. Create a regular user with `sudo`/`wheel` privileges.

### Rocky Linux 10

```bash
# Create user
useradd -m -s /bin/bash deployer
passwd deployer

# Add to wheel group (Rocky's sudo equivalent)
usermod -aG wheel deployer

# Test
su - deployer
sudo echo "sudo works"
```

### Ubuntu 26.04

```bash
# Create user (interactive prompt)
adduser deployer

# Add to sudo group
usermod -aG sudo deployer

# Test
su - deployer
sudo echo "sudo works"
```

> **Tip:** Install `tmux` on the VPS. If your SSH drops, reattach with `tmux attach` — no lost progress.
>
> ```bash
> # Rocky
> sudo dnf install -y tmux
>
> # Ubuntu
> sudo apt install -y tmux
> ```

---

## Step 3: DNS Configuration

Point your domain to the VPS:

1. Clear any existing A/AAAA/CNAME records at your registrar
2. Add an **A record** for `@` (root domain) pointing to your server's IPv4
3. Optionally add a `www` CNAME pointing to `@`

Find your server IP:

```bash
ip -4 addr show | grep inet
# or
curl -4 ifconfig.me
```

DNS propagation takes minutes to hours. Move on to security while waiting.

---

## Step 4: Harden SSH

SSH is your front door. Lock it down.

### 4a. Copy your SSH key

From your **local machine**:

```bash
ssh-copy-id deployer@<server-ip>
```

Test key-based login before proceeding:

```bash
ssh deployer@<server-ip>
```

### 4b. Edit sshd_config

```bash
sudo vim /etc/ssh/sshd_config
```

Set or uncomment these lines:

```
PasswordAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
# Rocky: also check /etc/ssh/sshd_config.d/*.conf for overrides
# Ubuntu: also check /etc/ssh/sshd_config.d/50-cloud-init.conf
```

### 4c. Clean up cloud-init overrides

Cloud images often ship a drop-in that re-enables password auth. Check and fix:

```bash
# Rocky: typically no cloud-init ssh override, but check:
sudo grep -r "PasswordAuthentication" /etc/ssh/sshd_config.d/

# Ubuntu: commonly ships 50-cloud-init.conf
sudo vim /etc/ssh/sshd_config.d/50-cloud-init.conf
# Comment out or delete any PasswordAuthentication yes line
```

### 4d. Reload and Verify

```bash
sudo systemctl reload sshd

# This MUST fail:
ssh root@<server-ip>
# Permission denied (publickey) ← good

# This MUST work:
ssh deployer@<server-ip>
```

**⚠️ Do not close your current SSH session until you've verified a new session works.** Open a second terminal for testing.

---

## Step 5: Firewall

### Rocky Linux 10 — firewalld

Rocky uses `firewalld` by default (not `ufw`).

```bash
# Check status
sudo systemctl status firewalld

# If not running, install and start:
sudo dnf install -y firewalld
sudo systemctl enable --now firewalld

# Default zones
sudo firewall-cmd --get-default-zone   # usually 'public'

# Allow SSH (CRITICAL — do this first)
sudo firewall-cmd --permanent --add-service=ssh

# Reload to apply
sudo firewall-cmd --reload

# Verify
sudo firewall-cmd --list-all
```

### Ubuntu 26.04 — UFW

```bash
# Enable UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (CRITICAL — do this first)
sudo ufw allow 22/tcp

# Enable
sudo ufw enable

# Verify
sudo ufw status verbose
```

> **Docker bypass warning:** Docker manipulates `iptables` directly, which can bypass both `firewalld` and `ufw` rules for published ports. The solution: don't publish container ports directly. Use a reverse proxy (Step 7) and only expose ports 80/443 on the host.

---

## Step 6: Install Docker

### Rocky Linux 10

```bash
# Remove old Docker packages if any
sudo dnf remove -y docker docker-client docker-client-latest docker-common \
    docker-latest docker-latest-logrotate docker-logrotate docker-engine

# Add Docker repo
sudo dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo

# Install Docker
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable
sudo systemctl enable --now docker

# Add user to docker group
sudo usermod -aG docker deployer

# Verify
docker --version
docker compose version
```

If `dnf config-manager` isn't available:

```bash
sudo dnf install -y 'dnf-command(config-manager)'
```

### Ubuntu 26.04

```bash
# Remove old packages
for pkg in docker.io docker-doc docker-compose docker-compose-v2 \
    podman-docker containerd runc; do
    sudo apt-get remove -y $pkg 2>/dev/null
done

# Add Docker's GPG key
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add repo
echo "deb [arch=$(dpkg --print-architecture) \
  signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io \
    docker-buildx-plugin docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker deployer

# Verify
docker --version
docker compose version
```

**Log out and back in** (or `newgrp docker`) for the group change to take effect.

---

## Step 7: Deploy the Application Stack

We'll use Docker Compose with a Go guestbook app + PostgreSQL, just like the original.

Create the project directory:

```bash
mkdir -p ~/guestbook/db
cd ~/guestbook
```

Create a secure Postgres password:

```bash
echo "your-strong-random-password-here" > db/postgres-password.txt
chmod 600 db/postgres-password.txt
```

### Initial `compose.yaml`

```yaml
services:
  db:
    image: postgres:17
    restart: always
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres-password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    secrets:
      - postgres-password

  guestbook:
    image: ghcr.io/yourusername/guestbook:prod
    restart: always
    environment:
      DATABASE_URL: postgres://postgres:${POSTGRES_PASSWORD}@db:5432/postgres?sslmode=disable
    ports:
      - "8080:8080"
    depends_on:
      - db

secrets:
  postgres-password:
    file: ./db/postgres-password.txt

volumes:
  postgres-data:
```

Deploy:

```bash
export POSTGRES_PASSWORD=$(cat db/postgres-password.txt)
docker compose up -d
```

Verify:

```bash
docker compose ps
curl http://localhost:8080
```

> **Don't expose port 8080 on the host permanently.** We'll remove it after setting up the reverse proxy.

---

## Step 8: Reverse Proxy with Traefik

Traefik handles routing, TLS termination, and load balancing — all via Docker labels.

Update `compose.yaml`:

```yaml
services:
  reverse-proxy:
    image: traefik:v3.3
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
    ports:
      - "80:80"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro

  db:
    # ... unchanged

  guestbook:
    # ... unchanged except:
    ports: []            # ← remove the host port mapping
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.guestbook.rule=Host(`yourdomain.com`)"

# ... secrets and volumes unchanged
```

Open port 80 on the firewall:

```bash
# Rocky
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload

# Ubuntu
sudo ufw allow 80/tcp
```

Redeploy:

```bash
docker compose up -d
```

Now visit `http://yourdomain.com`. Traefik routes traffic to the guestbook container.

---

## Step 9: Load Balancing — Run Multiple Instances

Traefik automatically load-balances across containers with the same service name.

```bash
docker compose up -d --scale guestbook=3
```

To make it permanent, add to `compose.yaml`:

```yaml
services:
  guestbook:
    # ...
    deploy:
      replicas: 3
```

> Traefik round-robins by default. No extra config needed.

---

## Step 10: HTTPS with Let's Encrypt (Automatic TLS)

Update Traefik service in `compose.yaml`:

```yaml
services:
  reverse-proxy:
    image: traefik:v3.3
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=you@example.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - letsencrypt:/letsencrypt
```

Update guestbook labels:

```yaml
services:
  guestbook:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.guestbook.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.guestbook.entrypoints=websecure"
      - "traefik.http.routers.guestbook.tls.certresolver=letsencrypt"

      # HTTP → HTTPS redirect
      - "traefik.http.routers.guestbook-http.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.guestbook-http.entrypoints=web"
      - "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https"
      - "traefik.http.routers.guestbook-http.middlewares=redirect-to-https"
```

Open port 443:

```bash
# Rocky
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# Ubuntu
sudo ufw allow 443/tcp
```

Redeploy:

```bash
docker compose up -d
```

Traefik automatically obtains and renews Let's Encrypt certificates. The `acme.json` file stores them — keep it safe (600 permissions, handled by Docker volume).

---

## Step 11: Automated Deployments with Watchtower

Watchtower monitors Docker image registries and updates running containers when new images appear.

Add to `compose.yaml`:

```yaml
services:
  watchtower:
    image: containrrr/watchtower
    command:
      - "--label-enable"          # Only update containers with the label
      - "--interval"
      - "30"                      # Check every 30 seconds
      - "--rolling-restart"       # One container at a time (for multi-replica)
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
```

Add the label to guestbook:

```yaml
services:
  guestbook:
    labels:
      # ... existing Traefik labels
      - "com.centurylinklabs.watchtower.enable=true"
```

Now when you push a new image to `ghcr.io/yourusername/guestbook:prod`, Watchtower picks it up within 30 seconds and performs a rolling restart — zero downtime.

---

## Step 12: Monitoring

Free uptime monitoring options:

- **[Uptime Robot](https://uptimerobot.com)** — 50 monitors, 5-minute checks, email alerts. Free tier.
- **[Better Uptime](https://betterstack.com/better-uptime)** — 3-minute checks, heartbeat, status page. 10 monitors free.
- **[Uptime Kuma](https://github.com/louislam/uptime-kuma)** — Self-hosted. Run it in Docker on the same VPS or a separate tiny instance.

Set up a monitor for `https://yourdomain.com` and configure alerting (email, Telegram, Discord, Slack).

---

## Final `compose.yaml`

The complete, production-ready stack:

```yaml
services:
  reverse-proxy:
    image: traefik:v3.3
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=you@example.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - letsencrypt:/letsencrypt

  db:
    image: postgres:17
    restart: always
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres-password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    secrets:
      - postgres-password

  guestbook:
    image: ghcr.io/yourusername/guestbook:prod
    restart: always
    environment:
      DATABASE_URL: postgres://postgres:${POSTGRES_PASSWORD}@db:5432/postgres?sslmode=disable
    deploy:
      replicas: 3
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.guestbook.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.guestbook.entrypoints=websecure"
      - "traefik.http.routers.guestbook.tls.certresolver=letsencrypt"
      - "traefik.http.routers.guestbook-http.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.guestbook-http.entrypoints=web"
      - "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https"
      - "traefik.http.routers.guestbook-http.middlewares=redirect-to-https"
      - "com.centurylinklabs.watchtower.enable=true"
    depends_on:
      - db

  watchtower:
    image: containrrr/watchtower
    command:
      - "--label-enable"
      - "--interval"
      - "30"
      - "--rolling-restart"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro

secrets:
  postgres-password:
    file: ./db/postgres-password.txt

volumes:
  postgres-data:
  letsencrypt:
```

Deploy:

```bash
export POSTGRES_PASSWORD=$(cat db/postgres-password.txt)
docker compose up -d
```

---

## OS-Specific Quick Reference

| Task | Rocky Linux 10 | Ubuntu 26.04 |
|------|---------------|-------------|
| Package install | `dnf install -y <pkg>` | `apt install -y <pkg>` |
| Package search | `dnf search <pkg>` | `apt search <pkg>` |
| Add repo | `dnf config-manager --add-repo <url>` | `add-apt-repository` or manual `.list` |
| User create | `useradd -m <user>` | `adduser <user>` |
| Sudo group | `wheel` | `sudo` |
| Firewall | `firewalld` (`firewall-cmd`) | `ufw` |
| Service mgmt | `systemctl` | `systemctl` |
| SELinux | Enforcing by default (`getenforce`) | AppArmor by default |
| Logs | `journalctl -u <unit>` | `journalctl -u <unit>` |
| Cron | `crond` | `cron` |
| EPEL (extra pkgs) | `dnf install -y epel-release` | N/A |

### Rocky SELinux Note

If SELinux blocks Docker operations (socket access, volume mounts):

```bash
# Check if SELinux is the culprit
sudo ausearch -m avc -ts recent

# Temporary (for testing): set Docker context
sudo semanage fcontext -a -t container_file_t "/path/to/mount(/.*)?"
sudo restorecon -Rv /path/to/mount
```

Usually Docker and SELinux coexist fine on Rocky 10 with default policies. Only intervene if you see `Permission denied` in container logs despite correct file permissions.

---

## Checklist

- [ ] Non-root user created with sudo/wheel
- [ ] SSH: `PasswordAuthentication no`, `PermitRootLogin no`
- [ ] Firewall: only 22, 80, 443 open
- [ ] Docker installed, user in `docker` group
- [ ] App running as `docker compose up -d`
- [ ] Traefik reverse proxy routing traffic
- [ ] HTTPS active with Let's Encrypt auto-renewal
- [ ] Multiple app replicas running
- [ ] Watchtower handling rolling updates
- [ ] Uptime monitor configured with alerts

---

Setting up a production-ready VPS is less intimidating than it looks. Traefik + Watchtower + Docker Compose gives you 90% of what a PaaS offers — with more control, predictable billing, and no vendor lock-in. Both Rocky Linux 10 and Ubuntu 26.04 make excellent foundations; pick the ecosystem you're most comfortable with.
