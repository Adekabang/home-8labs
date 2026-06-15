---
title: "Setting Up a Production-Ready VPS from Scratch — Rocky Linux 10 & Ubuntu 26.04"
description: "Step-by-step guide to hardening and deploying a production-ready VPS on Rocky Linux 10 or Ubuntu 26.04 — SSH hardening, firewalld/UFW, Docker, Traefik reverse proxy, Let's Encrypt TLS, load balancing, Watchtower auto-deploy, and uptime monitoring."
date: 2026-06-16
sidebar:
  order: 0
---

     1|# Setting Up a Production-Ready VPS from Scratch — Rocky Linux 10 & Ubuntu 26.04
     2|
     3|> Adapted from [Dreams of Code](https://dreamsofcode.io/blog/setting-up-a-production-ready-vps-from-scratch) — dual-OS guide covering both RHEL-family and Debian-family setups.
     4|
     5|---
     6|
     7|Deploying to the cloud has never been easier. Platform-as-a-Service (PaaS) options like Railway, Fly.io, and Render make going live a breeze. But PaaS isn't perfect for every use case — long-running tasks, heavy data transfer, and predictable billing often push teams toward a **VPS (Virtual Private Server)**.
     8|
     9|The perceived difficulty of hardening and configuring a raw VPS scares people off. But is it actually hard? We set out to prove it isn't — with a production-ready stack on both **Rocky Linux 10** and **Ubuntu 26.04 LTS**.
    10|
    11|## What "Production-Ready" Means Here
    12|
    13|- DNS pointing to the server
    14|- Application deployed and running (Docker)
    15|- HTTPS/TLS with automatic cert provisioning & renewal (Let's Encrypt)
    16|- Hardened SSH — no root login, no password auth
    17|- Firewall blocking unnecessary ports
    18|- High availability — multiple app instances
    19|- Load balancing via reverse proxy
    20|- Automated rolling deployments
    21|- Uptime monitoring with alerts
    22|
    23|**Constraints:** No Kubernetes. No Coolify. No Terraform. Simple tooling, minimal domain expertise.
    24|
    25|---
    26|
    27|## Step 1: Provisioning the VPS
    28|
    29|Pick a provider (Hetzner, Hostinger, DigitalOcean, Vultr). We used a **2 vCPU / 8 GB RAM** instance.
    30|
    31|During setup via your provider's panel:
    32|1. Select **Rocky Linux 10** or **Ubuntu 26.04 LTS**
    33|2. Set a strong root password
    34|3. Add your SSH public key
    35|4. Disable any "malware scanner" or monitoring agent if you don't need it
    36|
    37|Once deployed, test SSH:
    38|
    39|```bash
    40|ssh root@<your-server-ip>
    41|```
    42|
    43|---
    44|
    45|## Step 2: Create a Non-Root User
    46|
    47|Working as root is a bad habit. Create a regular user with `sudo`/`wheel` privileges.
    48|
    49|### Rocky Linux 10
    50|
    51|```bash
    52|# Create user
    53|useradd -m -s /bin/bash deployer
    54|passwd deployer
    55|
    56|# Add to wheel group (Rocky's sudo equivalent)
    57|usermod -aG wheel deployer
    58|
    59|# Test
    60|su - deployer
    61|sudo echo "sudo works"
    62|```
    63|
    64|### Ubuntu 26.04
    65|
    66|```bash
    67|# Create user (interactive prompt)
    68|adduser deployer
    69|
    70|# Add to sudo group
    71|usermod -aG sudo deployer
    72|
    73|# Test
    74|su - deployer
    75|sudo echo "sudo works"
    76|```
    77|
    78|> **Tip:** Install `tmux` on the VPS. If your SSH drops, reattach with `tmux attach` — no lost progress.
    79|>
    80|> ```bash
    81|> # Rocky
    82|> sudo dnf install -y tmux
    83|>
    84|> # Ubuntu
    85|> sudo apt install -y tmux
    86|> ```
    87|
    88|---
    89|
    90|## Step 3: DNS Configuration
    91|
    92|Point your domain to the VPS:
    93|
    94|1. Clear any existing A/AAAA/CNAME records at your registrar
    95|2. Add an **A record** for `@` (root domain) pointing to your server's IPv4
    96|3. Optionally add a `www` CNAME pointing to `@`
    97|
    98|Find your server IP:
    99|
   100|```bash
   101|ip -4 addr show | grep inet
   102|# or
   103|curl -4 ifconfig.me
   104|```
   105|
   106|DNS propagation takes minutes to hours. Move on to security while waiting.
   107|
   108|---
   109|
   110|## Step 4: Harden SSH
   111|
   112|SSH is your front door. Lock it down.
   113|
   114|### 4a. Copy your SSH key
   115|
   116|From your **local machine**:
   117|
   118|```bash
   119|ssh-copy-id deployer@<server-ip>
   120|```
   121|
   122|Test key-based login before proceeding:
   123|
   124|```bash
   125|ssh deployer@<server-ip>
   126|```
   127|
   128|### 4b. Edit sshd_config
   129|
   130|```bash
   131|sudo vim /etc/ssh/sshd_config
   132|```
   133|
   134|Set or uncomment these lines:
   135|
   136|```
   137|PasswordAuthentication no
   138|PermitRootLogin no
   139|PubkeyAuthentication yes
   140|# Rocky: also check /etc/ssh/sshd_config.d/*.conf for overrides
   141|# Ubuntu: also check /etc/ssh/sshd_config.d/50-cloud-init.conf
   142|```
   143|
   144|### 4c. Clean up cloud-init overrides
   145|
   146|Cloud images often ship a drop-in that re-enables password auth. Check and fix:
   147|
   148|```bash
   149|# Rocky: typically no cloud-init ssh override, but check:
   150|sudo grep -r "PasswordAuthentication" /etc/ssh/sshd_config.d/
   151|
   152|# Ubuntu: commonly ships 50-cloud-init.conf
   153|sudo vim /etc/ssh/sshd_config.d/50-cloud-init.conf
   154|# Comment out or delete any PasswordAuthentication yes line
   155|```
   156|
   157|### 4d. Reload and Verify
   158|
   159|```bash
   160|sudo systemctl reload sshd
   161|
   162|# This MUST fail:
   163|ssh root@<server-ip>
   164|# Permission denied (publickey) ← good
   165|
   166|# This MUST work:
   167|ssh deployer@<server-ip>
   168|```
   169|
   170|**⚠️ Do not close your current SSH session until you've verified a new session works.** Open a second terminal for testing.
   171|
   172|---
   173|
   174|## Step 5: Firewall
   175|
   176|### Rocky Linux 10 — firewalld
   177|
   178|Rocky uses `firewalld` by default (not `ufw`).
   179|
   180|```bash
   181|# Check status
   182|sudo systemctl status firewalld
   183|
   184|# If not running, install and start:
   185|sudo dnf install -y firewalld
   186|sudo systemctl enable --now firewalld
   187|
   188|# Default zones
   189|sudo firewall-cmd --get-default-zone   # usually 'public'
   190|
   191|# Allow SSH (CRITICAL — do this first)
   192|sudo firewall-cmd --permanent --add-service=ssh
   193|
   194|# Reload to apply
   195|sudo firewall-cmd --reload
   196|
   197|# Verify
   198|sudo firewall-cmd --list-all
   199|```
   200|
   201|### Ubuntu 26.04 — UFW
   202|
   203|```bash
   204|# Enable UFW
   205|sudo ufw default deny incoming
   206|sudo ufw default allow outgoing
   207|
   208|# Allow SSH (CRITICAL — do this first)
   209|sudo ufw allow 22/tcp
   210|
   211|# Enable
   212|sudo ufw enable
   213|
   214|# Verify
   215|sudo ufw status verbose
   216|```
   217|
   218|> **Docker bypass warning:** Docker manipulates `iptables` directly, which can bypass both `firewalld` and `ufw` rules for published ports. The solution: don't publish container ports directly. Use a reverse proxy (Step 7) and only expose ports 80/443 on the host.
   219|
   220|---
   221|
   222|## Step 6: Install Docker
   223|
   224|### Rocky Linux 10
   225|
   226|```bash
   227|# Remove old Docker packages if any
   228|sudo dnf remove -y docker docker-client docker-client-latest docker-common \
   229|    docker-latest docker-latest-logrotate docker-logrotate docker-engine
   230|
   231|# Add Docker repo
   232|sudo dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo
   233|
   234|# Install Docker
   235|sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   236|
   237|# Start and enable
   238|sudo systemctl enable --now docker
   239|
   240|# Add user to docker group
   241|sudo usermod -aG docker deployer
   242|
   243|# Verify
   244|docker --version
   245|docker compose version
   246|```
   247|
   248|If `dnf config-manager` isn't available:
   249|
   250|```bash
   251|sudo dnf install -y 'dnf-command(config-manager)'
   252|```
   253|
   254|### Ubuntu 26.04
   255|
   256|```bash
   257|# Remove old packages
   258|for pkg in docker.io docker-doc docker-compose docker-compose-v2 \
   259|    podman-docker containerd runc; do
   260|    sudo apt-get remove -y $pkg 2>/dev/null
   261|done
   262|
   263|# Add Docker's GPG key
   264|sudo apt-get update
   265|sudo apt-get install -y ca-certificates curl
   266|sudo install -m 0755 -d /etc/apt/keyrings
   267|sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
   268|    -o /etc/apt/keyrings/docker.asc
   269|sudo chmod a+r /etc/apt/keyrings/docker.asc
   270|
   271|# Add repo
   272|echo "deb [arch=$(dpkg --print-architecture) \
   273|  signed-by=/etc/apt/keyrings/docker.asc] \
   274|  https://download.docker.com/linux/ubuntu \
   275|  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
   276|  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   277|
   278|# Install
   279|sudo apt-get update
   280|sudo apt-get install -y docker-ce docker-ce-cli containerd.io \
   281|    docker-buildx-plugin docker-compose-plugin
   282|
   283|# Add user to docker group
   284|sudo usermod -aG docker deployer
   285|
   286|# Verify
   287|docker --version
   288|docker compose version
   289|```
   290|
   291|**Log out and back in** (or `newgrp docker`) for the group change to take effect.
   292|
   293|---
   294|
   295|## Step 7: Deploy the Application Stack
   296|
   297|We'll use Docker Compose with a Go guestbook app + PostgreSQL, just like the original.
   298|
   299|Create the project directory:
   300|
   301|```bash
   302|mkdir -p ~/guestbook/db
   303|cd ~/guestbook
   304|```
   305|
   306|Create a secure Postgres password:
   307|
   308|```bash
   309|echo "your-strong-random-password-here" > db/postgres-password.txt
   310|chmod 600 db/postgres-password.txt
   311|```
   312|
   313|### Initial `compose.yaml`
   314|
   315|```yaml
   316|services:
   317|  db:
   318|    image: postgres:17
   319|    restart: always
   320|    environment:
   321|      POSTGRES_PASSWORD_FILE: /run/secrets/postgres-password
   322|    volumes:
   323|      - postgres-data:/var/lib/postgresql/data
   324|    secrets:
   325|      - postgres-password
   326|
   327|  guestbook:
   328|    image: ghcr.io/yourusername/guestbook:prod
   329|    restart: always
   330|    environment:
   331|      DATABASE_URL: postgres://postgres:${POSTGRES_PASSWORD}@db:5432/postgres?sslmode=disable
   332|    ports:
   333|      - "8080:8080"
   334|    depends_on:
   335|      - db
   336|
   337|secrets:
   338|  postgres-password:
   339|    file: ./db/postgres-password.txt
   340|
   341|volumes:
   342|  postgres-data:
   343|```
   344|
   345|Deploy:
   346|
   347|```bash
   348|export POSTGRES_PASSWORD=$(cat db/postgres-password.txt)
   349|docker compose up -d
   350|```
   351|
   352|Verify:
   353|
   354|```bash
   355|docker compose ps
   356|curl http://localhost:8080
   357|```
   358|
   359|> **Don't expose port 8080 on the host permanently.** We'll remove it after setting up the reverse proxy.
   360|
   361|---
   362|
   363|## Step 8: Reverse Proxy with Traefik
   364|
   365|Traefik handles routing, TLS termination, and load balancing — all via Docker labels.
   366|
   367|Update `compose.yaml`:
   368|
   369|```yaml
   370|services:
   371|  reverse-proxy:
   372|    image: traefik:v3.3
   373|    command:
   374|      - "--providers.docker=true"
   375|      - "--providers.docker.exposedbydefault=false"
   376|      - "--entrypoints.web.address=:80"
   377|    ports:
   378|      - "80:80"
   379|    volumes:
   380|      - /var/run/docker.sock:/var/run/docker.sock:ro
   381|
   382|  db:
   383|    # ... unchanged
   384|
   385|  guestbook:
   386|    # ... unchanged except:
   387|    ports: []            # ← remove the host port mapping
   388|    labels:
   389|      - "traefik.enable=true"
   390|      - "traefik.http.routers.guestbook.rule=Host(`yourdomain.com`)"
   391|
   392|# ... secrets and volumes unchanged
   393|```
   394|
   395|Open port 80 on the firewall:
   396|
   397|```bash
   398|# Rocky
   399|sudo firewall-cmd --permanent --add-service=http
   400|sudo firewall-cmd --reload
   401|
   402|# Ubuntu
   403|sudo ufw allow 80/tcp
   404|```
   405|
   406|Redeploy:
   407|
   408|```bash
   409|docker compose up -d
   410|```
   411|
   412|Now visit `http://yourdomain.com`. Traefik routes traffic to the guestbook container.
   413|
   414|---
   415|
   416|## Step 9: Load Balancing — Run Multiple Instances
   417|
   418|Traefik automatically load-balances across containers with the same service name.
   419|
   420|```bash
   421|docker compose up -d --scale guestbook=3
   422|```
   423|
   424|To make it permanent, add to `compose.yaml`:
   425|
   426|```yaml
   427|services:
   428|  guestbook:
   429|    # ...
   430|    deploy:
   431|      replicas: 3
   432|```
   433|
   434|> Traefik round-robins by default. No extra config needed.
   435|
   436|---
   437|
   438|## Step 10: HTTPS with Let's Encrypt (Automatic TLS)
   439|
   440|Update Traefik service in `compose.yaml`:
   441|
   442|```yaml
   443|services:
   444|  reverse-proxy:
   445|    image: traefik:v3.3
   446|    command:
   447|      - "--providers.docker=true"
   448|      - "--providers.docker.exposedbydefault=false"
   449|      - "--entrypoints.web.address=:80"
   450|      - "--entrypoints.websecure.address=:443"
   451|      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
   452|      - "--certificatesresolvers.letsencrypt.acme.email=you@example.com"
   453|      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
   454|    ports:
   455|      - "80:80"
   456|      - "443:443"
   457|    volumes:
   458|      - /var/run/docker.sock:/var/run/docker.sock:ro
   459|      - letsencrypt:/letsencrypt
   460|```
   461|
   462|Update guestbook labels:
   463|
   464|```yaml
   465|services:
   466|  guestbook:
   467|    labels:
   468|      - "traefik.enable=true"
   469|      - "traefik.http.routers.guestbook.rule=Host(`yourdomain.com`)"
   470|      - "traefik.http.routers.guestbook.entrypoints=websecure"
   471|      - "traefik.http.routers.guestbook.tls.certresolver=letsencrypt"
   472|
   473|      # HTTP → HTTPS redirect
   474|      - "traefik.http.routers.guestbook-http.rule=Host(`yourdomain.com`)"
   475|      - "traefik.http.routers.guestbook-http.entrypoints=web"
   476|      - "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https"
   477|      - "traefik.http.routers.guestbook-http.middlewares=redirect-to-https"
   478|```
   479|
   480|Open port 443:
   481|
   482|```bash
   483|# Rocky
   484|sudo firewall-cmd --permanent --add-service=https
   485|sudo firewall-cmd --reload
   486|
   487|# Ubuntu
   488|sudo ufw allow 443/tcp
   489|```
   490|
   491|Redeploy:
   492|
   493|```bash
   494|docker compose up -d
   495|```
   496|
   497|Traefik automatically obtains and renews Let's Encrypt certificates. The `acme.json` file stores them — keep it safe (600 permissions, handled by Docker volume).
   498|
   499|---
   500|
   501|## Step 11: Automated Deployments with Watchtower
   502|
   503|Watchtower monitors Docker image registries and updates running containers when new images appear.
   504|
   505|Add to `compose.yaml`:
   506|
   507|```yaml
   508|services:
   509|  watchtower:
   510|    image: containrrr/watchtower
   511|    command:
   512|      - "--label-enable"          # Only update containers with the label
   513|      - "--interval"
   514|      - "30"                      # Check every 30 seconds
   515|      - "--rolling-restart"       # One container at a time (for multi-replica)
   516|    volumes:
   517|      - /var/run/docker.sock:/var/run/docker.sock:ro
   518|```
   519|
   520|Add the label to guestbook:
   521|
   522|```yaml
   523|services:
   524|  guestbook:
   525|    labels:
   526|      # ... existing Traefik labels
   527|      - "com.centurylinklabs.watchtower.enable=true"
   528|```
   529|
   530|Now when you push a new image to `ghcr.io/yourusername/guestbook:prod`, Watchtower picks it up within 30 seconds and performs a rolling restart — zero downtime.
   531|
   532|---
   533|
   534|## Step 12: Monitoring
   535|
   536|Free uptime monitoring options:
   537|
   538|- **[Uptime Robot](https://uptimerobot.com)** — 50 monitors, 5-minute checks, email alerts. Free tier.
   539|- **[Better Uptime](https://betterstack.com/better-uptime)** — 3-minute checks, heartbeat, status page. 10 monitors free.
   540|- **[Uptime Kuma](https://github.com/louislam/uptime-kuma)** — Self-hosted. Run it in Docker on the same VPS or a separate tiny instance.
   541|
   542|Set up a monitor for `https://yourdomain.com` and configure alerting (email, Telegram, Discord, Slack).
   543|
   544|---
   545|
   546|## Final `compose.yaml`
   547|
   548|The complete, production-ready stack:
   549|
   550|```yaml
   551|services:
   552|  reverse-proxy:
   553|    image: traefik:v3.3
   554|    command:
   555|      - "--providers.docker=true"
   556|      - "--providers.docker.exposedbydefault=false"
   557|      - "--entrypoints.web.address=:80"
   558|      - "--entrypoints.websecure.address=:443"
   559|      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
   560|      - "--certificatesresolvers.letsencrypt.acme.email=you@example.com"
   561|      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
   562|    ports:
   563|      - "80:80"
   564|      - "443:443"
   565|    volumes:
   566|      - /var/run/docker.sock:/var/run/docker.sock:ro
   567|      - letsencrypt:/letsencrypt
   568|
   569|  db:
   570|    image: postgres:17
   571|    restart: always
   572|    environment:
   573|      POSTGRES_PASSWORD_FILE: /run/secrets/postgres-password
   574|    volumes:
   575|      - postgres-data:/var/lib/postgresql/data
   576|    secrets:
   577|      - postgres-password
   578|
   579|  guestbook:
   580|    image: ghcr.io/yourusername/guestbook:prod
   581|    restart: always
   582|    environment:
   583|      DATABASE_URL: postgres://postgres:${POSTGRES_PASSWORD}@db:5432/postgres?sslmode=disable
   584|    deploy:
   585|      replicas: 3
   586|    labels:
   587|      - "traefik.enable=true"
   588|      - "traefik.http.routers.guestbook.rule=Host(`yourdomain.com`)"
   589|      - "traefik.http.routers.guestbook.entrypoints=websecure"
   590|      - "traefik.http.routers.guestbook.tls.certresolver=letsencrypt"
   591|      - "traefik.http.routers.guestbook-http.rule=Host(`yourdomain.com`)"
   592|      - "traefik.http.routers.guestbook-http.entrypoints=web"
   593|      - "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https"
   594|      - "traefik.http.routers.guestbook-http.middlewares=redirect-to-https"
   595|      - "com.centurylinklabs.watchtower.enable=true"
   596|    depends_on:
   597|      - db
   598|
   599|  watchtower:
   600|    image: containrrr/watchtower
   601|    command:
   602|      - "--label-enable"
   603|      - "--interval"
   604|      - "30"
   605|      - "--rolling-restart"
   606|    volumes:
   607|      - /var/run/docker.sock:/var/run/docker.sock:ro
   608|
   609|secrets:
   610|  postgres-password:
   611|    file: ./db/postgres-password.txt
   612|
   613|volumes:
   614|  postgres-data:
   615|  letsencrypt:
   616|```
   617|
   618|Deploy:
   619|
   620|```bash
   621|export POSTGRES_PASSWORD=$(cat db/postgres-password.txt)
   622|docker compose up -d
   623|```
   624|
   625|---
   626|
   627|## OS-Specific Quick Reference
   628|
   629|| Task | Rocky Linux 10 | Ubuntu 26.04 |
   630||------|---------------|-------------|
   631|| Package install | `dnf install -y <pkg>` | `apt install -y <pkg>` |
   632|| Package search | `dnf search <pkg>` | `apt search <pkg>` |
   633|| Add repo | `dnf config-manager --add-repo <url>` | `add-apt-repository` or manual `.list` |
   634|| User create | `useradd -m <user>` | `adduser <user>` |
   635|| Sudo group | `wheel` | `sudo` |
   636|| Firewall | `firewalld` (`firewall-cmd`) | `ufw` |
   637|| Service mgmt | `systemctl` | `systemctl` |
   638|| SELinux | Enforcing by default (`getenforce`) | AppArmor by default |
   639|| Logs | `journalctl -u <unit>` | `journalctl -u <unit>` |
   640|| Cron | `crond` | `cron` |
   641|| EPEL (extra pkgs) | `dnf install -y epel-release` | N/A |
   642|
   643|### Rocky SELinux Note
   644|
   645|If SELinux blocks Docker operations (socket access, volume mounts):
   646|
   647|```bash
   648|# Check if SELinux is the culprit
   649|sudo ausearch -m avc -ts recent
   650|
   651|# Temporary (for testing): set Docker context
   652|sudo semanage fcontext -a -t container_file_t "/path/to/mount(/.*)?"
   653|sudo restorecon -Rv /path/to/mount
   654|```
   655|
   656|Usually Docker and SELinux coexist fine on Rocky 10 with default policies. Only intervene if you see `Permission denied` in container logs despite correct file permissions.
   657|
   658|---
   659|
   660|## Checklist
   661|
   662|- [ ] Non-root user created with sudo/wheel
   663|- [ ] SSH: `PasswordAuthentication no`, `PermitRootLogin no`
   664|- [ ] Firewall: only 22, 80, 443 open
   665|- [ ] Docker installed, user in `docker` group
   666|- [ ] App running as `docker compose up -d`
   667|- [ ] Traefik reverse proxy routing traffic
   668|- [ ] HTTPS active with Let's Encrypt auto-renewal
   669|- [ ] Multiple app replicas running
   670|- [ ] Watchtower handling rolling updates
   671|- [ ] Uptime monitor configured with alerts
   672|
   673|---
   674|
   675|Setting up a production-ready VPS is less intimidating than it looks. Traefik + Watchtower + Docker Compose gives you 90% of what a PaaS offers — with more control, predictable billing, and no vendor lock-in. Both Rocky Linux 10 and Ubuntu 26.04 make excellent foundations; pick the ecosystem you're most comfortable with.
   676|