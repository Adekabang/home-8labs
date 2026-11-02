---
title: "Hubungkan server dengan SSH"
description: "Verifikasi kunci host dan diagnosis SSH tanpa melemahkan autentikasi."
contentId: "customer-getting-started-ssh"
owner: "8Labs support"
reviewedVersion: "LabsPanel 5.3.15"
reviewedDate: "2026-11-02"
translationStatus: "translated"
---

**Pembaca:** administrator tamu atau pengguna SSH yang diberi izin. SSH bergantung pada image, layanan tamu, firewall, dan jaringan layanan.

## Sebelum terhubung

- Temukan alamat dan port pada [informasi jaringan](/id/docs/servers/network/).
- Pastikan nama pengguna dari rincian image atau layanan. Jangan menganggap selalu `root`.
- Dapatkan kata sandi melalui jalur aman, atau temukan kunci privat yang sesuai di perangkat Anda.
- Pastikan server berjalan dan instalasinya selesai.

Penyediaan dengan kunci saja mungkin tidak menetapkan kata sandi root.
Menambahkan kunci SSH akun belakangan tidak membuktikan kunci itu sudah diterapkan pada tamu yang ada.
Jangan membagikan kunci privat, kata sandi, atau tautan peluncuran konsol.

## Verifikasi sidik jari host

Koneksi SSH pertama meminta Anda mempercayai kunci host server.
Dapatkan sidik jari yang benar melalui jalur tepercaya yang terpisah.
Contohnya, buka konsol peramban yang sudah diautentikasi, lalu jalankan perintah ini **di dalam tamu**:

```bash
ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
```

Bandingkan jenis kunci dan sidik jari SHA256 dengan permintaan SSH lokal.
Jika berkas tersebut tidak ada, periksa jenis kunci host yang benar-benar digunakan sistem operasi.
Jika tidak dapat memverifikasi secara terpisah, hentikan koneksi dan minta metode verifikasi tepercaya dari dukungan.
Hasil `ssh-keyscan` melalui jalur yang sama tidak menjadi verifikasi terpisah.

## Hubungkan dari komputer Anda

Jalankan perintah berikut di **komputer lokal**. Alamat ini hanya contoh dokumentasi, bukan server aktif.
Ganti alamat, nama pengguna, port, dan lokasi kunci dengan nilai layanan Anda.

```bash
# Contoh IPv4 publik
ssh -p 22 ubuntu@192.0.2.10
# Contoh IPv6 publik
ssh -p 22 ubuntu@2001:db8::10
# Pilih kunci privat yang sudah tersimpan secara lokal
ssh -i ~/.ssh/id_ed25519 -p 22 ubuntu@192.0.2.10
```

1. Bandingkan sidik jari host dengan nilai yang telah diverifikasi.
2. Terima hanya jika nilainya sama.
3. Masukkan kata sandi tamu jika image memakai autentikasi kata sandi.
4. Pastikan prompt menunjukkan server yang benar.

Karakter kata sandi biasanya tidak terlihat saat diketik.
Prompt shell membuktikan Anda berhasil masuk melalui SSH, bukan bahwa semua aplikasi sehat.

## Jika koneksi gagal

| Gejala             | Periksa                                                 | Tindakan aman                                                         |
| ------------------ | ------------------------------------------------------- | --------------------------------------------------------------------- |
| Timeout            | Alamat, port eksternal NAT, rute IPv6, status, firewall | Periksa jaringan tamu melalui konsol; jangan membuka semua port.      |
| Connection refused | Layanan SSH dan port yang didengarkan di tamu           | Periksa status layanan sesuai sistem operasi melalui konsol.          |
| Permission denied  | Nama pengguna, kunci, metode autentikasi image          | Pastikan kunci publik cocok dengan kunci privat lokal.                |
| Kunci host berubah | Riwayat instal ulang dan sidik jari baru                | Hentikan koneksi. Verifikasi sebelum mengubah satu entri known-host.  |
| No route to host   | Jaringan lokal dan keluarga alamat tujuan               | Gunakan jaringan yang diizinkan dengan dukungan keluarga IP tersebut. |

Untuk kegagalan layanan, periksa `systemctl status ssh` atau `systemctl status sshd` **di dalam tamu**, sesuai sistem operasinya.
Jangan membagikan seluruh keluaran SSH terperinci secara publik. Keluaran dapat memuat nama pengguna, lokasi berkas, dan alamat jaringan.
Jangan mengaktifkan masuk root dengan kata sandi, mematikan pemeriksaan kunci, atau mengganti seluruh konfigurasi untuk mengatasi penyebab yang belum jelas.
Pertahankan konsol yang berfungsi saat melakukan perubahan konfigurasi SSH yang diizinkan.

[Bantuan konsol](/id/docs/servers/console/) · [Firewall](/id/docs/servers/firewall/) · [Dukungan](/id/docs/help/contact/)
