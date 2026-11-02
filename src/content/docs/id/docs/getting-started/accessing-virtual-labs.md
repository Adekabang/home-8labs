---
title: "Pilih cara menghubungkan server"
description: "Temukan alamat tujuan, lalu pilih SSH, RDP, atau konsol peramban."
contentId: "customer-getting-started-accessing-virtual-labs"
owner: "8Labs support"
reviewedVersion: "LabsPanel 5.3.15"
reviewedDate: "2026-11-02"
translationStatus: "translated"
---

**Pembaca:** pengguna yang memiliki izin server. Siapkan alamat server, nama pengguna sistem operasi, dan metode autentikasi yang ditetapkan.
Akun Cloud Panel berbeda dari akun sistem operasi di dalam server.

## Temukan alamat tujuan

Buka **Servers**, pilih server, lalu periksa informasi jaringannya.
Gunakan alamat yang ditetapkan beserta port layanan, bukan alamat contoh atau gateway.
Untuk layanan NAT, gunakan alamat eksternal dan port eksternal yang diterbitkan.
Alamat privat server tidak dapat diakses langsung dari internet.
Baca [alamat jaringan](/id/docs/servers/network/) jika penetapan alamat tidak tersedia atau tidak jelas.

## Server Linux dan layanan SSH

Gunakan terminal lokal di Linux, macOS, atau Windows yang memiliki klien SSH.
Ikuti [koneksi SSH pertama](/id/docs/getting-started/ssh/) untuk memilih kunci dan memverifikasi sidik jari host.
Alamat khusus IPv6 memerlukan konektivitas IPv6 yang berfungsi pada jaringan Anda.
VPN atau tunnel pihak ketiga dapat mengubah konektivitas dan privasi; keberhasilannya tidak dijamin penyedia.

## Server Windows

Ikuti [koneksi RDP pertama](/id/docs/getting-started/rdp/) hanya jika image Windows yang dibeli mendukung RDP.
Pastikan akun tamu, sumber kata sandi, dan alamat eksternal yang diizinkan sebelum terhubung.

## Konsol peramban

Buka **Console** pada halaman server. Ikuti [bantuan konsol](/id/docs/servers/console/).
Konsol grafis VNC dan konsol serial bergantung pada konfigurasi server serta template.
Konsol tidak memerlukan jaringan SSH tamu, tetapi koneksi host dan autentikasi sistem operasi tetap diperlukan.
Jangan menganggap semua image memiliki kata sandi root atau layar masuk serial.

## Jika koneksi gagal

Bedakan koneksi yang kehabisan waktu, ditolak, dan gagal autentikasi.
Gunakan [tabel diagnosis SSH](/id/docs/getting-started/ssh/#jika-koneksi-gagal) sebelum mengubah konfigurasi tamu.
Jangan mengaktifkan masuk root dengan kata sandi atau mematikan pemeriksaan kunci host sebagai perbaikan umum.
Jika semua metode gagal, [hubungi dukungan](/id/docs/help/contact/) dengan pesan kesalahan yang disamarkan dan waktu kejadian.
