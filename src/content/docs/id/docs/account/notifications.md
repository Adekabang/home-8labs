---
title: Mengelola langganan notifikasi
description: Hubungkan atau putuskan Telegram, pahami jenis pemberitahuan, dan atasi notifikasi yang tidak diterima.
contentId: account-notifications
owner: 8Labs support
reviewedVersion: LabsPanel 5.3.15
reviewedDate: 2026-11-02
translationStatus: translated
---

LabsPanel mendukung notifikasi Telegram opsional. Menghubungkan akun berarti berlangganan pemberitahuan pelanggan yang tersedia; memutuskan koneksi menghentikan langganan tersebut.

## Pengguna, ketersediaan, dan prasyarat

Panduan ini ditujukan untuk pemilik akun runtime di [cloud.8labs.id](https://cloud.8labs.id). Anda harus masuk dengan akun sendiri dan memiliki akses ke akun Telegram penerima.

**Ketersediaan bersyarat.** Fitur pada sumber dinonaktifkan secara bawaan. Operator harus mengaktifkan notifikasi dan mengonfigurasi bot bersama sebelum kartu koneksi muncul. Sumber saja belum memastikan ketersediaan atau alur peristiwa yang diaktifkan pada layanan.

Penagihan tetap berada di [my.8labs.id](https://my.8labs.id). Jangan menganggap koneksi Telegram di LabsPanel mencakup semua pesan portal penagihan atau menggantikan catatan tagihan di sana.

<span id="how-it-works"></span>

## Pahami langganan

Satu bot untuk seluruh penerapan layanan melayani pengguna yang terhubung. Panel mengaitkan identitas chat Telegram dengan akun runtime Anda.

Langganan bersifat **semua atau tidak sama sekali**, bukan daftar preferensi per peristiwa. Pengguna terhubung menerima notifikasi pelanggan yang berlaku untuk akun dan alur yang diaktifkan. **Disconnect** menghentikan seluruh notifikasi dari langganan ini.

Pengiriman memakai antrean, berjalan asinkron, dan diupayakan tanpa jaminan selalu sampai. Kegagalan sementara dapat dicoba ulang; kegagalan permanen dapat dihentikan. Tindakan server atau penagihan tidak menunggu Telegram, dan pesan yang tidak diterima bukan bukti tindakan gagal.

<span id="operator-setup"></span>

## Jika kartu koneksi tidak tersedia

Konfigurasi operator diperlukan, tetapi pelanggan tidak perlu membuat bot, memberikan token bot, mendaftarkan webhook, atau menjalankan pekerja antrean.

Jika **Telegram notifications** tidak muncul pada pengaturan akun, tanyakan kepada [dukungan](/id/docs/help/contact) apakah fitur tersedia pada layanan. Jangan memasukkan token bot lain atau mengikuti bot yang tidak dikenal sebagai jalan pintas.

<span id="connecting-your-account-users"></span>

## Hubungkan akun

1. Buka **Account** dan cari **Telegram notifications** pada halaman pengaturan.
2. Pilih **Connect Telegram**.
3. Izinkan tautan Telegram terbuka, atau gunakan **Open the link again** jika tersedia.
4. Pastikan bot dan akun Telegram yang digunakan sudah benar.
5. Di Telegram, pilih **Start**.
6. Tunggu konfirmasi koneksi dari bot dan status **Connected** pada panel.

Tautan koneksi berisi kode sekali pakai yang berlaku 15 menit. Membuka tautan saja belum cukup; Anda harus memilih **Start**. Panel memperbarui status tertunda secara otomatis, jadi tunggu konfirmasi.

Jika kode kedaluwarsa, kembali ke panel dan minta tautan baru. Perlakukan tautan sebagai rahasia dan jangan membagikannya.

### Putuskan koneksi akun

Pilih **Disconnect** pada kartu yang sama lalu tunggu status **Not connected**. Pemutusan menghapus identitas chat yang tersimpan dan menghentikan seluruh notifikasi dari langganan ini. Tindakan server atau penagihan tidak dibatalkan.

<span id="what-youll-be-notified-about"></span>

## Pahami kategori pemberitahuan yang tersedia

Implementasi sumber mencakup kategori peristiwa **pelanggan** berikut jika alur terkait diaktifkan:

- Server ditangguhkan karena saldo atau komitmen yang berlaku telah berakhir.
- Server yang ditangguhkan diaktifkan kembali.
- Saldo terkait menipis atau server melewati tenggat.
- Top-up dompet yang didukung telah dikonfirmasi.

Ini adalah kemampuan implementasi, bukan janji bahwa semua kategori aktif untuk akun layanan Anda. Secara khusus, daftar ini tidak membuktikan adanya dompet runtime atau integrasi portal penagihan.

Administrator platform dapat menerima pemberitahuan terpisah tentang top-up manual yang menunggu konfirmasi, jika alur operator tersebut diaktifkan. Status admin organisasi tidak menjadikan Anda administrator platform.

Peristiwa pembuatan, instalasi, dan penghapusan server tidak dikirim oleh implementasi Telegram ini. Sumber mencatatnya dalam jejak audit. Gunakan status server terkini di panel untuk mengikuti proses operasi.

<span id="privacy-security"></span>
<span id="privacy--security"></span>

## Lindungi langganan dan privasi

Sumber melindungi kredensial bot dan rahasia webhook dengan enkripsi saat tersimpan serta memeriksa token rahasia webhook. Pelanggan tidak semestinya perlu memberikan rahasia operator tersebut.

Koneksi mengirimkan kaitan yang diperlukan untuk menyampaikan pemberitahuan melalui Telegram. Isi pemberitahuan dapat mengungkap informasi akun atau server kepada chat yang dipilih. Gunakan akun Telegram privat dan pertimbangkan siapa yang dapat membaca pesannya.

Kode koneksi bersifat acak, sekali pakai, dan berumur pendek, tetapi tetap merupakan rahasia. Jangan bagikan tautan koneksi atau tangkapan layar yang memuatnya. Putuskan koneksi jika akun Telegram salah, lalu hubungkan akun yang benar.

## Pemecahan masalah dan eskalasi

- **Kartu tidak muncul:** fitur mungkin dinonaktifkan atau belum dikonfigurasi. Tanyakan ketersediaannya kepada dukungan.
- **Telegram tidak terbuka:** izinkan tab baru atau gunakan **Open the link again** selama kode masih berlaku.
- **Masih Not connected:** pilih **Start** di Telegram dan tunggu konfirmasi. Minta tautan baru jika kedaluwarsa.
- **Connected tetapi tidak ada pemberitahuan:** pastikan peristiwa terkait terjadi pada alur yang diaktifkan. Pengiriman tidak dijamin.
- **Hanya membutuhkan sebagian pemberitahuan:** langganan ini tidak memiliki kontrol per peristiwa; putuskan koneksi jika tidak menginginkan seluruh kumpulan yang tersedia.
- **Penerima salah atau koneksi tidak dikenal:** segera putuskan dan tinjau [keamanan akun](/id/docs/account/security).

Untuk masalah pengiriman yang belum selesai, kirim perkiraan waktu peristiwa, status koneksi, dan identitas server kepada [dukungan 8Labs](/id/docs/help/contact). Jangan kirim kode koneksi, kredensial bot, atau pesan privat tanpa penyamaran. Gunakan panel dan portal penagihan untuk memeriksa status masing-masing secara resmi.

## Panduan terkait

- [Keamanan akun](/id/docs/account/security)
- [Personal API keys dan webhook](/id/docs/account/api-keys)
- [Ringkasan server](/id/docs/servers/overview)
- [Tagihan dan paket](/id/docs/billing-plans/overview)
