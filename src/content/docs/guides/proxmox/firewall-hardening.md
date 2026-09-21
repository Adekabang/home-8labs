---
title: Proxmox VE Management Access Hardening
description: Panduan hardening akses management Proxmox VE pada node standalone dengan interface management yang menghadap jaringan publik.
sidebar:
  order: 5
---

> **Cakupan:** Proxmox VE standalone node dengan management interface langsung menghadap jaringan publik.
> **Tujuan:** membatasi akses management Proxmox tanpa mengubah atau mengganggu firewall milik VM/tenant.

---

## 1. Tujuan

Hardening ini ditujukan untuk kondisi ketika interface management Proxmox memiliki public IP dan tidak memungkinkan dipindahkan ke management LAN/private network.

Target akhirnya:

- SSH `TCP/22` hanya dapat diakses dari source administrator yang diizinkan.
- Proxmox Web UI/API `TCP/8006` hanya dapat diakses dari source administrator yang diizinkan.
- Port management yang tidak digunakan tidak dibuka ke Internet.
- Firewall VM/tenant tetap bekerja seperti sebelumnya.
- Perubahan dapat divalidasi sebelum diterapkan.
- Tersedia automatic rollback apabila akses management terputus.

---

## 2. Variabel / Placeholder

Gunakan variabel agar dokumentasi tidak berisi IP produksi.

```text
<PVE_HOSTNAME>       = hostname node Proxmox
<PVE_PUBLIC_IP>      = public IP management Proxmox

<ADMIN_NET_1>        = subnet admin utama
<ADMIN_NET_2>        = subnet admin backup
<ADMIN_NET_3>        = subnet admin backup lainnya
<ADMIN_SINGLE_IP>    = single trusted admin IP /32

<NON_ADMIN_TEST_IP>  = IP yang dipakai untuk simulasi source non-admin
```

Contoh menggunakan documentation-only IP:

```text
<PVE_HOSTNAME>       = pve01
<PVE_PUBLIC_IP>      = 198.51.100.10

<ADMIN_NET_1>        = 203.0.113.16/28
<ADMIN_NET_2>        = 198.51.100.64/29
<ADMIN_NET_3>        = 192.0.2.128/29
<ADMIN_SINGLE_IP>    = 203.0.113.250/32

<NON_ADMIN_TEST_IP>  = 192.0.2.10
```

Untuk subnet, sebaiknya gunakan **network address**, bukan salah satu host address.

Contoh:

```text
203.0.113.17/28
```

dinormalisasi menjadi:

```text
203.0.113.16/28
```

---

## 3. Prinsip Penting: Host Firewall dan VM Firewall Terpisah

Traffic yang menuju host Proxmox melewati jalur:

```text
Internet
   |
   v
INPUT
   |
   v
PVEFW-INPUT
   |
   v
PVEFW-HOST-IN
```

Sedangkan traffic VM melewati:

```text
Internet / Network
       |
       v
    FORWARD
       |
       v
PVEFW-FWBR-IN / OUT
       |
       v
tap<VMID>i0-IN / OUT
       |
       v
      VM
```

Karena itu hardening management host harus dibatasi pada **host-side firewall**.

Jangan melakukan tindakan berikut apabila firewall VM dikelola tenant/user:

```text
iptables -F
iptables-legacy -F
pve-firewall stop
Datacenter Firewall enable: 0
mengubah firewall=1 pada NIC VM
mengubah /etc/pve/firewall/<VMID>.fw
```

---

## 4. Audit Status Firewall

Periksa status firewall:

```bash
pve-firewall status
```

Contoh output:

```text
Status: enabled/running
```

Jika output seperti:

```text
Status: disabled/stopped
```

jangan lanjut menggunakan prosedur yang mengasumsikan firewall guest sedang aktif.

---

## 5. Periksa Konfigurasi Datacenter Firewall

```bash
cat /etc/pve/firewall/cluster.fw
```

Contoh kondisi yang terlalu terbuka:

```text
[OPTIONS]

enable: 1

[RULES]

IN Web(ACCEPT) -log nolog
IN SSH(ACCEPT) -log nolog
IN ACCEPT -p udp -dport 8006 -log nolog
IN ACCEPT -p tcp -dport 8006 -log nolog
```

Konfigurasi seperti di atas berarti SSH dan `8006/tcp` dapat diakses tanpa pembatasan source.

---

## 6. Periksa Host Firewall

```bash
cat /etc/pve/nodes/$(hostname)/host.fw
```

Contoh:

```text
[RULES]

IN ACCEPT -p icmp -log nolog
```

Rule node seperti ICMP dapat tetap dipertahankan apabila memang dibutuhkan.

---

## 7. Pastikan Node Standalone atau Cluster

```bash
pvecm status
```

Contoh standalone node:

```text
Error: Corosync config '/etc/pve/corosync.conf' does not exist - is this node part of a cluster?
```

Ini menunjukkan node tidak tergabung dalam Corosync cluster.

Pada environment cluster, desain firewall harus mempertimbangkan kebutuhan antar-node seperti migration, corosync, storage, dan sebagainya.

---

## 8. Identifikasi Management Interface

```bash
ip -4 -br addr
```

Contoh:

```text
lo       UNKNOWN   127.0.0.1/8
vmbr0    UP        198.51.100.10/30
```

Dalam contoh tersebut:

```text
vmbr0 = management/public bridge
198.51.100.10 = public management IP
```

Periksa juga konfigurasi jaringan:

```bash
cat /etc/network/interfaces
```

Contoh:

```text
auto vmbr0
iface vmbr0 inet static
        address 198.51.100.10/30
        gateway 198.51.100.9
        bridge-ports eno1
        bridge-stp off
        bridge-fd 0
```

---

## 9. Audit IPv6

```bash
ip -6 addr show scope global
```

Jika kosong:

```text
root@pve01:~#
```

berarti host saat ini tidak memiliki global IPv6 address.

Jika ada global IPv6, hardening IPv6 harus dilakukan juga karena `sshd` atau `pveproxy` mungkin listen di IPv6.

---

## 10. Audit Service yang Listen

```bash
ss -lntup
```

Contoh:

```text
tcp LISTEN 0 128  0.0.0.0:22     0.0.0.0:* users:(("sshd",...))
tcp LISTEN 0 4096       *:8006          *:* users:(("pveproxy",...))
tcp LISTEN 0 4096       *:3128          *:* users:(("spiceproxy",...))
```

Service penting Proxmox biasanya:

```text
TCP/22    SSH
TCP/8006  Web UI / API
TCP/3128  SPICE proxy
```

Jika tidak ada service yang listen pada `80/443`, rule `Web(ACCEPT)` biasanya tidak diperlukan.

`8006` menggunakan **TCP**, sehingga `UDP/8006` tidak perlu dibuka.

---

## 11. Audit Active Host Firewall

```bash
iptables-legacy -S PVEFW-HOST-IN
```

Contoh rule terlalu terbuka:

```text
-A PVEFW-HOST-IN -p tcp --dport 80 -j RETURN
-A PVEFW-HOST-IN -p tcp --dport 443 -j RETURN
-A PVEFW-HOST-IN -p tcp --dport 22 -j RETURN
-A PVEFW-HOST-IN -p udp --dport 8006 -j RETURN
-A PVEFW-HOST-IN -p tcp --dport 8006 -j RETURN
```

Pada Proxmox firewall legacy backend, `RETURN` di chain tersebut berfungsi sebagai jalur allow kembali menuju parent chain.

---

## 12. Pastikan Traffic VM Terpisah

Periksa:

```bash
iptables-legacy -S PVEFW-FORWARD
```

Contoh:

```text
-N PVEFW-FORWARD
-A PVEFW-FORWARD -m conntrack --ctstate INVALID -j DROP
-A PVEFW-FORWARD -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
-A PVEFW-FORWARD -m physdev --physdev-in fwln+ --physdev-is-bridged -j PVEFW-FWBR-IN
-A PVEFW-FORWARD -m physdev --physdev-out fwln+ --physdev-is-bridged -j PVEFW-FWBR-OUT
```

Sedangkan host:

```bash
iptables-legacy -S PVEFW-INPUT
```

Contoh:

```text
-N PVEFW-INPUT
-A PVEFW-INPUT -j PVEFW-HOST-IN
```

Ini menjadi salah satu validasi bahwa host management dan VM forwarding berada di chain berbeda.

---

## 13. Audit `local_network`

```bash
pve-firewall localnet
```

Contoh sebelum hardening:

```text
local hostname: pve01
local IP address: 198.51.100.10
network auto detect: 198.51.100.8/30
using detected local_network: 198.51.100.8/30
```

Masalahnya, seluruh `/30` tersebut dapat masuk ke built-in management network Proxmox.

Cek:

```bash
ipset list PVEFW-0-management-v4
```

Contoh:

```text
Name: PVEFW-0-management-v4
Type: hash:net
Number of entries: 1

Members:
198.51.100.8/30
```

Untuk standalone public host, lebih aman override `local_network` menjadi IP host sendiri.

---

## 14. Buat Custom Administrator IPSet

Gunakan custom IPSet:

```text
admin_sources
```

Contoh:

```text
[IPSET admin_sources]

<ADMIN_NET_1>
<ADMIN_NET_2>
<ADMIN_NET_3>
<ADMIN_SINGLE_IP>
```

Contoh terisi:

```text
[IPSET admin_sources]

203.0.113.16/28
198.51.100.64/29
192.0.2.128/29
203.0.113.250/32
```

Hindari memakai special IPSet bernama `management` untuk general allowlist apabila kebutuhan hanya SSH dan GUI, karena Proxmox menggunakan management network untuk beberapa service internal lain juga.

---

## 15. Konfigurasi Target

Target `/etc/pve/firewall/cluster.fw`:

```text
[OPTIONS]

enable: 1


[ALIASES]

local_network <PVE_PUBLIC_IP>


[IPSET admin_sources]

<ADMIN_NET_1>
<ADMIN_NET_2>
<ADMIN_NET_3>
<ADMIN_SINGLE_IP>


[RULES]

IN SSH(ACCEPT) -source +admin_sources -log nolog
IN ACCEPT -source +admin_sources -p tcp -dport 8006 -log nolog
```

Contoh:

```text
[OPTIONS]

enable: 1


[ALIASES]

local_network 198.51.100.10


[IPSET admin_sources]

203.0.113.16/28
198.51.100.64/29
192.0.2.128/29
203.0.113.250/32


[RULES]

IN SSH(ACCEPT) -source +admin_sources -log nolog
IN ACCEPT -source +admin_sources -p tcp -dport 8006 -log nolog
```

---

## 16. Jangan Disable Firewall untuk Staging

Jika firewall VM sudah aktif, jangan melakukan:

```text
enable: 0
```

sebagai metode staging.

Mematikan Datacenter Firewall dapat berdampak pada enforcement firewall VM.

Sebagai gantinya buat candidate di `/root`:

```bash
nano /root/cluster.fw.candidate
```

atau:

```bash
cat > /root/cluster.fw.candidate <<'EOF'
...
EOF
```

File ini belum dibaca oleh Proxmox firewall.

---

## 17. Validasi Candidate: Parse dan Compile

Gunakan parser Proxmox langsung:

```bash
perl -MPVE::Firewall -e '
    my $f = "/root/cluster.fw.candidate";

    my $conf = PVE::Firewall::load_clusterfw_conf($f);

    die "PARSE FAILED\n" if !$conf;

    print "PARSE OK\n";

    my ($ruleset, $ipset_rules, $ipset_changes, $ebtables) =
        PVE::Firewall::compile($conf, undef, undef, undef);

    print "COMPILE OK\n";
'
```

Hasil yang diharapkan:

```text
PARSE OK
COMPILE OK
```

Jika muncul error, jangan apply candidate.

---

## 18. Buat Baseline Firewall VM

Fingerprint semua file firewall VM:

```bash
find /etc/pve/firewall -maxdepth 1 -type f -regextype posix-extended \
  -regex '.*/[0-9]+\.fw' -print0 \
  | sort -z \
  | xargs -0 sha256sum \
  | sha256sum
```

Contoh:

```text
=== GUEST FW CONFIG FINGERPRINT ===
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa  -
```

Fingerprint NIC VM:

```bash
for id in $(qm list | awk 'NR>1 {print $1}' | sort -n); do
  echo "VM $id"
  qm config "$id" | grep -E '^net[0-9]+:'
done | sha256sum
```

Contoh:

```text
bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb  -
```

Simpan kedua hash tersebut.

Sesudah hardening, hash harus tetap sama.

---

## 19. Backup Firewall Sebelum Apply

```bash
TS="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="/root/pve-fw-backup-$TS"

mkdir -p "$BACKUP_DIR"

cp /etc/pve/firewall/cluster.fw \
   "$BACKUP_DIR/cluster.fw"

if [ -f /etc/pve/nodes/<PVE_HOSTNAME>/host.fw ]; then
    cp /etc/pve/nodes/<PVE_HOSTNAME>/host.fw \
       "$BACKUP_DIR/host.fw"
fi
```

Contoh hasil:

```text
/root/pve-fw-backup-YYYYMMDD-HHMMSS/
├── cluster.fw
└── host.fw
```

Verifikasi:

```bash
sha256sum \
  /etc/pve/firewall/cluster.fw \
  "$BACKUP_DIR/cluster.fw"
```

Hasil yang diharapkan, kedua hash sama:

```text
111111... /etc/pve/firewall/cluster.fw
111111... /root/pve-fw-backup-YYYYMMDD-HHMMSS/cluster.fw
```

---

## 20. Buat Rollback Script

```bash
cat > /root/pve-fw-rollback.sh <<'EOF'
#!/bin/bash
set -e

cp /root/pve-fw-backup-<TIMESTAMP>/cluster.fw \
   /etc/pve/firewall/cluster.fw

echo "Rollback config restored at $(date)"

sleep 15

echo "=== FIREWALL STATUS ==="
pve-firewall status

echo
echo "=== HOST RULES ==="
iptables-legacy -S PVEFW-HOST-IN
EOF

chmod 700 /root/pve-fw-rollback.sh
```

---

## 21. Arm Automatic Rollback

Sebelum apply:

```bash
systemd-run \
  --unit=pve-fw-rollback \
  --on-active=10m \
  --timer-property=AccuracySec=1s \
  /root/pve-fw-rollback.sh
```

Contoh:

```text
Running timer as unit: pve-fw-rollback.timer
Will run service as unit: pve-fw-rollback.service
```

Verifikasi:

```bash
systemctl list-timers pve-fw-rollback.timer --no-pager
```

Contoh:

```text
NEXT                         LEFT   UNIT
Mon YYYY-MM-DD HH:MM:SS      9min   pve-fw-rollback.timer
```

Jangan apply sebelum rollback timer terlihat aktif.

---

## 22. Apply Candidate

Apply:

```bash
cp /root/cluster.fw.candidate \
   /etc/pve/firewall/cluster.fw
```

Gunakan plain `cp`.

Menggunakan:

```bash
cp -a
```

ke `/etc/pve` dapat menghasilkan warning seperti:

```text
cp: clearing permissions for '/etc/pve/firewall/cluster.fw': Operation not permitted
```

karena `/etc/pve` menggunakan Proxmox Cluster File System (`pmxcfs`).

Tunggu reload:

```bash
sleep 10
```

Kemudian:

```bash
pve-firewall status
```

Hasil yang diharapkan:

```text
Status: enabled/running
```

---

## 23. Verifikasi Host Rules Sesudah Apply

```bash
iptables-legacy -S PVEFW-HOST-IN
```

Bagian penting expected:

```text
-A PVEFW-HOST-IN -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
-A PVEFW-HOST-IN -m set --match-set PVEFW-0-admin_sources-v4 src -p tcp --dport 22 -j RETURN
-A PVEFW-HOST-IN -m set --match-set PVEFW-0-admin_sources-v4 src -p tcp --dport 8006 -j RETURN
...
-A PVEFW-HOST-IN -j PVEFW-Drop
-A PVEFW-HOST-IN -j DROP
```

Rule berikut sudah tidak boleh ada:

```text
-p tcp --dport 22 -j RETURN
```

tanpa source restriction.

Begitu juga:

```text
-p tcp --dport 8006 -j RETURN
```

tanpa source restriction.

---

## 24. Verifikasi Administrator IPSet

```bash
ipset list PVEFW-0-admin_sources-v4
```

Contoh:

```text
Name: PVEFW-0-admin_sources-v4
Type: hash:net

Number of entries: 4

Members:
203.0.113.16/28
198.51.100.64/29
192.0.2.128/29
203.0.113.250
```

Jumlah dan isi harus sesuai dengan daftar administrator.

---

## 25. Verifikasi `local_network`

```bash
pve-firewall localnet
```

Hasil yang diharapkan:

```text
local hostname: pve01
local IP address: 198.51.100.10
network auto detect: 198.51.100.8/30
using user defined local_network: 198.51.100.10
```

Perhatikan:

```text
using user defined local_network
```

bukan:

```text
using detected local_network
```

---

## 26. Simulasi SSH dari Non-Admin

```bash
pve-firewall simulate \
  --from outside \
  --to host \
  --source <NON_ADMIN_TEST_IP> \
  --dest <PVE_PUBLIC_IP> \
  --protocol tcp \
  --dport 22 \
  --verbose 1 | tail -n 12
```

Contoh:

```text
Test packet:
  from    : outside
  to      : host
  proto   : tcp
  source  : 192.0.2.10
  dest    : 198.51.100.10
  dport   : 22

ACTION: DROP
```

Hasil yang diharapkan:

```text
ACTION: DROP
```

---

## 27. Simulasi SSH dari Admin

```bash
pve-firewall simulate \
  --from outside \
  --to host \
  --source <ADMIN_SINGLE_IP> \
  --dest <PVE_PUBLIC_IP> \
  --protocol tcp \
  --dport 22 \
  --verbose 1 | tail -n 12
```

Contoh output:

```text
Test packet:
  from    : outside
  to      : host
  proto   : tcp
  source  : 203.0.113.250
  dest    : 198.51.100.10
  dport   : 22

ACTION: ACCEPT
```

Hasil yang diharapkan:

```text
ACTION: ACCEPT
```

---

## 28. Simulasi GUI dari Non-Admin

```bash
pve-firewall simulate \
  --from outside \
  --to host \
  --source <NON_ADMIN_TEST_IP> \
  --dest <PVE_PUBLIC_IP> \
  --protocol tcp \
  --dport 8006 \
  --verbose 1 | tail -n 12
```

Hasil yang diharapkan:

```text
Test packet:
  from    : outside
  to      : host
  proto   : tcp
  source  : 192.0.2.10
  dest    : 198.51.100.10
  dport   : 8006

ACTION: DROP
```

---

## 29. Simulasi GUI dari Admin

```bash
pve-firewall simulate \
  --from outside \
  --to host \
  --source <ADMIN_SINGLE_IP> \
  --dest <PVE_PUBLIC_IP> \
  --protocol tcp \
  --dport 8006 \
  --verbose 1 | tail -n 12
```

Hasil yang diharapkan:

```text
Test packet:
  from    : outside
  to      : host
  proto   : tcp
  source  : 203.0.113.250
  dest    : 198.51.100.10
  dport   : 8006

ACTION: ACCEPT
```

---

## 30. Test Fresh GUI Connection

Jangan hanya mengandalkan session browser yang sudah terbuka.

Koneksi lama dapat tetap hidup karena rule:

```text
RELATED,ESTABLISHED
```

Buka browser incognito/private baru lalu akses:

```text
https://<PVE_PUBLIC_IP>:8006
```

Setelah berhasil, cek:

```bash
ss -tnp state established '( sport = :8006 )'
```

Contoh:

```text
Recv-Q Send-Q Local Address:Port       Peer Address:Port
0      0      198.51.100.10:8006      203.0.113.250:45123
0      0      198.51.100.10:8006      203.0.113.25:51290
```

Pastikan `Peer Address` berasal dari salah satu `<ADMIN_NET_X>`.

---

## 31. Verifikasi Firewall VM Tidak Berubah

Jalankan ulang fingerprint firewall VM:

```bash
find /etc/pve/firewall -maxdepth 1 -type f -regextype posix-extended \
  -regex '.*/[0-9]+\.fw' -print0 \
  | sort -z \
  | xargs -0 sha256sum \
  | sha256sum
```

Contoh sebelum:

```text
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa  -
```

Contoh sesudah:

```text
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa  -
```

Harus sama.

Kemudian NIC:

```bash
for id in $(qm list | awk 'NR>1 {print $1}' | sort -n); do
  echo "VM $id"
  qm config "$id" | grep -E '^net[0-9]+:'
done | sha256sum
```

Sebelum:

```text
bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb  -
```

Sesudah:

```text
bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb  -
```

Jika hash berubah, investigasi sebelum cancel rollback.

---

## 32. Cancel Automatic Rollback

Rollback baru boleh dicancel apabila seluruh checklist ini lolos:

```text
[OK] Firewall enabled/running
[OK] Non-admin -> TCP/22   = DROP
[OK] Admin     -> TCP/22   = ACCEPT
[OK] Non-admin -> TCP/8006 = DROP
[OK] Admin     -> TCP/8006 = ACCEPT
[OK] Fresh browser connection berhasil
[OK] Guest firewall fingerprint sama
[OK] Guest NIC fingerprint sama
```

Stop timer:

```bash
systemctl stop pve-fw-rollback.timer
```

Verifikasi:

```bash
systemctl list-timers --all --no-pager \
  | grep 'pve-fw-rollback' \
  || echo 'No active rollback timers'
```

Hasil yang diharapkan:

```text
No active rollback timers
```

---

## 33. Verifikasi Konfigurasi Akhir

Bandingkan candidate dengan live config:

```bash
sha256sum \
  /etc/pve/firewall/cluster.fw \
  /root/cluster.fw.candidate
```

Hasil yang diharapkan:

```text
cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc  /etc/pve/firewall/cluster.fw
cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc  /root/cluster.fw.candidate
```

Hash harus identik.

---

## 34. Bersihkan Transient Rollback Units

Opsional:

```bash
systemctl reset-failed \
  pve-fw-rollback.service \
  pve-fw-rollback-apply.service \
  pve-fw-rollback-verify.service \
  pve-fw-rollback-finalcheck.service 2>/dev/null || true
```

Kemudian:

```bash
systemctl list-units --all 'pve-fw-rollback*' --no-pager
```

Contoh hasil bersih:

```text
UNIT LOAD ACTIVE SUB DESCRIPTION

0 loaded units listed.
```

Backup sebaiknya **jangan langsung dihapus**.

---

## 35. Kondisi Akhir di Proxmox Web GUI

Pada:

```text
Datacenter
└── Firewall
    └── Rules
```

rule yang terlihat cukup:

| On | Type | Action | Macro | Protocol | Source           | D.Port |
| -- | ---- | ------ | ----- | -------- | ---------------- | ------ |
| ✓  | in   | ACCEPT | SSH   |          | `+admin_sources` |        |
| ✓  | in   | ACCEPT |       | tcp      | `+admin_sources` | 8006   |

Sedangkan:

```text
Datacenter
└── Firewall
    └── IPSet
```

berisi:

```text
admin_sources
├── <ADMIN_NET_1>
├── <ADMIN_NET_2>
├── <ADMIN_NET_3>
└── <ADMIN_SINGLE_IP>
```

Dan:

```text
Datacenter
└── Firewall
    └── Alias
```

memiliki:

```text
local_network = <PVE_PUBLIC_IP>
```

---

## 36. SSH Hardening Lanjutan

Setelah firewall allowlist stabil, audit SSH:

```bash
sshd -T | grep -E \
'^(permitrootlogin|passwordauthentication|pubkeyauthentication|maxauthtries) '
```

Contoh kondisi awal:

```text
maxauthtries 6
permitrootlogin yes
pubkeyauthentication yes
passwordauthentication yes
```

Target jangka panjang dapat berupa:

```text
pubkeyauthentication yes
passwordauthentication no
```

Untuk `PermitRootLogin`, sesuaikan dengan operational model.

Jangan disable password authentication sebelum semua lokasi administrator telah diuji menggunakan public key.

---

## 37. Arsitektur Akhir

```text
                         INTERNET
                            |
             +--------------+--------------+
             |                             |
        NON-ADMIN                       ADMIN
             |                      admin_sources
             |                             |
        TCP/22 DROP                  TCP/22 ACCEPT
        TCP/8006 DROP                TCP/8006 ACCEPT
             |                             |
             +--------------+--------------+
                            |
                            v
                     +-------------+
                     | PVE HOST    |
                     | public mgmt |
                     +-------------+
                            |
             +--------------+--------------+
             |                             |
             v                             v
       HOST INPUT                     VM FORWARD
    PVEFW-HOST-IN                   PVEFW-FWBR-*
             |                             |
             |                             v
      admin-only access               tap<VMID>
                                           |
                                           v
                                      VM Firewall
                                           |
                                    Tenant Managed
                                           |
                                      DO NOT MODIFY
```

## Operational Rule

> **Harden the Proxmox host without treating tenant VM firewall rules as part of the host hardening scope.**

Management access harus bersifat **explicit allowlist**, sedangkan konfigurasi firewall VM/tenant harus dianggap sebagai domain terpisah yang tidak diubah selama proses hardening host.
