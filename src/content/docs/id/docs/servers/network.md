---
title: Alamat server dan akses jaringan
description: Baca alamat IPv4, IPv6, dan endpoint NAT, pilih IPv4 utama, serta bedakan pengaturan tersimpan dari konfigurasi sistem tamu.
contentId: servers-network
owner: 8Labs support
reviewedVersion: LabsPanel 5.3.15
reviewedDate: 2026-11-02
translationStatus: translated
---

Panel menampilkan alamat yang dialokasikan dan metadata jaringan. Alamat, pilihan IP utama, atau catatan NAT yang terlihat belum membuktikan koneksi dari luar berhasil.

## Pengguna, izin, dan prasyarat

Panduan ini untuk pemilik server dan kolaborator berwenang di [cloud.8labs.id](https://cloud.8labs.id). Jenis alamat dan pemetaan NAT bergantung pada layanan Anda.

Mengubah IPv4 utama atau nameserver memerlukan `settings.manage`. Izin ini tidak memberikan `firewall.manage` atau hak mengalokasikan alamat baru.

Sebelum mengubah jaringan, catat konfigurasi lama dan pastikan [konsol](/id/docs/servers/console) berfungsi. Siapkan waktu pemeliharaan jika perubahan sistem tamu memerlukan penghentian layanan.

## Membaca alamat IPv4 dan IPv6

1. Buka **Overview** server dan cari **Network**.
2. Baca alamat, prefiks, gateway **GW**, dan alamat MAC yang ditampilkan.
3. Gunakan **Copy IP address** untuk menyalin alamat tanpa prefiks.
4. Periksa apakah koneksi Anda menggunakan alamat publik atau endpoint NAT yang tercatat.

IPv6 muncul jika dialokasikan. Keberadaannya belum memastikan konfigurasi sistem tamu, rute dari perangkat Anda, atau jalur firewall sudah benar. Pemilih **Primary IP** hanya untuk IPv4.

Jangan mengarang gateway, menggunakan alamat yang belum dialokasikan, atau menyalin pengaturan jaringan pelanggan lain. Hubungi dukungan jika tidak ada alamat.

Contoh `192.0.2.10`, `198.51.100.20`, dan `2001:db8::10` adalah alamat dokumentasi, bukan endpoint layanan yang dapat digunakan.

<span id="choosing-the-primary-ipv4"></span>

## Memilih IPv4 utama

1. Buka **Settings → General → Primary IP**.
2. Tinjau alamat IPv4, prefiks, dan gateway yang dialokasikan.
3. Pilih alamat yang dituju lalu tunggu hasilnya.
4. Pastikan alamat tersebut tetap ditandai sebagai utama.
5. Gunakan konsol untuk memeriksa alamat dan rute aktif sebelum mengubah DNS atau menutup koneksi lama.

Pilihan ini menyimpan metadata IP utama dan menyinkronkan ulang konfigurasi jaringan cloud-init. Tanpa pilihan utama, alamat pertama yang dialokasikan akan digunakan.

**Tersimpan bukan berarti sudah diterapkan dalam sistem tamu.** Ikuti persyaratan cloud-init sistem operasi Anda. Rencanakan shutdown atau startup yang diperlukan; jangan menganggap rute aktif langsung berubah.

Penyimpanan metadata dan sinkronisasi jaringan berlangsung pada tahap berbeda. Jika terjadi kesalahan, muat ulang pilihan dan periksa konektivitas sebelum mencoba lagi. Minta dukungan menyelaraskan pilihan tersimpan dengan sinkronisasi yang gagal.

Kontrol ini tidak memilih jalur trafik migrasi atau mengatur topologi jaringan virtual.

<span id="firewall-protection-during-network-changes"></span>

## Memahami perlindungan firewall saat sinkronisasi

Perubahan IP utama dan sinkronisasi alamat mempertahankan aturan firewall, kebijakan bawaan masuk/keluar, IP set khusus, serta set anti-spoofing adaptor lain.

LabsPanel hanya menyelaraskan `ipfilter-net0`: alamat IPv4 dan IPv6 yang dialokasikan ditambahkan sebelum anggota lama dihapus. Set tidak dihapus dan dibuat ulang. Firewall VM serta penyaringan IP tetap aktif; model adaptor, batas kecepatan, dan pengaturan lainnya dipertahankan.

Sinkronisasi rutin tidak mengatur ulang kebijakan bawaan, termasuk `DROP`. Server hasil kloning baru mendapat nilai awal `ACCEPT` hanya jika templat tidak menentukan kebijakan.

Kebijakan yang tetap terjaga bukan jaminan konektivitas. Kebijakan ketat tetap dapat memblokir alamat baru.

<span id="reviewing-a-web-firewall-preset"></span>

### Meninjau preset firewall web dengan aman

**Firewall → Review web preset** membuka tinjauan, bukan langsung menerapkan aturan. Baca [panduan firewall](/id/docs/servers/firewall) sebelum menerapkannya.

Preset membuka port pengelolaan, HTTP, dan HTTPS dari semua sumber sebelum aturan lama. Pembatasan sumber yang sudah ada dapat terlewati. Proses tidak atomik; aturan yang berhasil dibuat tetap ada jika sebagian proses gagal.

Pastikan konsol berfungsi. Gunakan aturan individual jika akses pengelolaan harus tetap dibatasi berdasarkan sumber.

<span id="port-forwards-nat"></span>

## Mengakses server melalui port forward NAT

IPv4 privat tidak dapat diakses langsung dari internet publik. Jika tersedia, **Overview → Network → Port Forwards** menampilkan endpoint publik yang tercatat.

```text
TCP  gateway.example.com:20022  →  :22  SSH
TCP  gateway.example.com:20080  →  :80
```

Artinya, `<host gateway>:<port publik>` diteruskan ke `<port privat>` server. Pada contoh SSH, hubungkan ke `gateway.example.com` pada port `20022`, bukan `22`.

Gunakan **Copy endpoint** untuk menyalin `host:port`. Perhatikan protokol: catatan TCP tidak membentuk pemetaan UDP. Daftar hanya muncul jika ada catatan.

Entri ini adalah metadata hanya-baca. Mencatat atau menampilkan pemetaan **tidak** membuat aturan gateway. Minta dukungan mengatur dan memverifikasi aturan gateway sebenarnya. Akses melalui IP publik tidak memerlukan mekanisme NAT ini.

Untuk pemetaan baru, sertakan identitas server, port privat tujuan, kebutuhan TCP/UDP, dan kegunaannya. Jangan kirim kredensial.

## Nameserver dan DNS

**Settings → General → Nameservers** mengubah resolver DNS server, bukan catatan DNS otoritatif domain Anda.

Masukkan IP resolver yang disetujui lalu pilih **Save**. Linux memerlukan shutdown lalu startup, bukan **Restart**, untuk jalur pembaruan cloud-init panel ini. Pada Windows, biarkan server menyala agar pembaruan dapat diterapkan.

Periksa resolusi nama dalam sistem tamu setelah perubahan diterapkan. Mengubah resolver tidak menerbitkan catatan A atau AAAA untuk situs Anda.

## Pemecahan masalah dan eskalasi

| Gejala                                        | Bukti dan langkah aman berikutnya                                                                                   |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| IPv4 atau IPv6 tidak terlihat                 | Pastikan server benar. Tanyakan alokasi alamat dan paket kepada dukungan; jangan memakai alamat tebakan.            |
| IP utama tersimpan tetapi IP lama masih aktif | Periksa sistem tamu melalui konsol. Tinjau cloud-init dan konfigurasi jaringan OS sebelum menjadwalkan penghentian. |
| Endpoint NAT mengalami timeout                | Pastikan host publik, port publik, dan protokol. Minta dukungan memeriksa aturan gateway dan tujuan.                |
| IP publik berfungsi tetapi domain gagal       | Periksa catatan A/AAAA dan hasil resolver. Catatan AAAA lama dapat mengarahkan koneksi ke jalur berbeda.            |
| Koneksi ditolak                               | Periksa apakah layanan tamu mendengarkan pada port tujuan. Aturan allow tidak menjalankan layanan.                  |
| Timeout setelah alamat berubah                | Periksa rute tamu, urutan firewall panel, dan firewall tamu. Jangan mematikan semua firewall sebagai jalan pintas.  |

Laporkan kegagalan sinkronisasi berulang, alokasi hilang, atau masalah gateway ke [dukungan 8Labs](/id/docs/help/contact). Sertakan ID server, waktu, endpoint, protokol, pesan kesalahan, dan hasil pengamatan yang sudah disensor. Jangan sertakan kunci privat atau kata sandi.

<span id="see-also"></span>

## Panduan terkait

- [Aturan firewall](/id/docs/servers/firewall)
- [Pengaturan server](/id/docs/servers/settings)
- [Akses SSH](/id/docs/getting-started/ssh)
- [Akses RDP](/id/docs/getting-started/rdp)
- [Mengatur server](/id/docs/servers/folders)
- [Pemecahan masalah](/id/docs/troubleshooting/overview)
