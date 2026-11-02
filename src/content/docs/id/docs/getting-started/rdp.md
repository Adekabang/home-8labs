---
title: "Hubungkan Windows dengan RDP"
description: "Gunakan alamat Windows yang diizinkan dan verifikasi identitas server."
contentId: "customer-getting-started-rdp"
owner: "8Labs support"
reviewedVersion: "LabsPanel 5.3.15"
reviewedDate: "2026-11-02"
translationStatus: "translated"
---

**Pembaca:** pengguna tamu Windows yang memiliki izin. **Ketersediaan:** image dan lisensi yang dibeli harus mendukung Remote Desktop.
Panduan ini tidak menjamin ketersediaan image Windows atau hak lisensinya.

## Sebelum terhubung

Pastikan edisi Windows, akun tamu, sumber kata sandi awal, dan izin RDP pada rincian layanan.
Temukan alamat tujuan pada [informasi jaringan](/id/docs/servers/network/).
Layanan NAT memerlukan alamat dan port eksternal; jangan memakai alamat privat tamu dari internet.
Utamakan VPN yang disetujui atau aturan sumber terbatas. Jangan membuka RDP untuk seluruh internet demi diagnosis.
Pastikan [konsol peramban](/id/docs/servers/console/) berfungsi sebelum mengubah firewall atau jaringan tamu.

## Buka Remote Desktop

1. Buka klien Remote Desktop yang disetujui pada komputer Anda.
2. Masukkan alamat layanan dan portnya.
3. Masukkan akun Windows yang diizinkan.
4. Periksa peringatan sertifikat atau identitas.
5. Verifikasi sertifikat yang belum dikenal melalui jalur tepercaya terpisah sebelum menerimanya.
6. Masukkan kata sandi tamu saat diminta.
7. Pastikan desktop Windows dan hostname sesuai tujuan.

Contoh alamat NAT IPv4 adalah `192.0.2.10:43389`.
Alamat dokumentasi tersebut bukan alamat aktif 8Labs.
Jangan menyimpan kredensial pada komputer bersama.
Memutus koneksi RDP biasanya membiarkan aplikasi berjalan; keluar dari akun Windows mengakhiri sesi pengguna.

## Jika koneksi gagal

| Gejala                              | Pemeriksaan aman                                                                          |
| ----------------------------------- | ----------------------------------------------------------------------------------------- |
| Timeout                             | Pastikan server berjalan, port eksternal benar, sumber diizinkan, dan rute tersedia.      |
| Koneksi ditolak atau tidak tersedia | Periksa Remote Desktop dan layanan Windows melalui konsol.                                |
| Autentikasi ditolak                 | Pastikan akun tamu, kata sandi, dan izin pengguna Remote Desktop.                         |
| Sertifikat berubah                  | Periksa instal ulang atau perubahan sertifikat yang diizinkan sebelum menyambung kembali. |
| Layar hitam atau sesi terkunci      | Periksa konsol dan keadaan Windows sebelum memulai ulang.                                 |

Jangan menonaktifkan Network Level Authentication atau seluruh aturan firewall sebagai perbaikan umum.
Jika konsol juga gagal, kirim waktu dan pesan kesalahan yang disamarkan kepada [dukungan](/id/docs/help/contact/), bukan kata sandi tamu.
