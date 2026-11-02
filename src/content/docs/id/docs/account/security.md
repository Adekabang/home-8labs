---
title: Mengamankan dan memulihkan akun
description: Kelola kata sandi, autentikasi dua faktor, kode pemulihan, sesi browser, dan kunci publik SSH akun.
contentId: account-security
owner: 8Labs support
reviewedVersion: LabsPanel 5.3.15
reviewedDate: 2026-11-02
translationStatus: translated
---

Kelola perlindungan akun runtime melalui **Account → Settings** di [cloud.8labs.id](https://cloud.8labs.id). Gunakan akun sendiri dan simpan materi pemulihan secara privat.

## Pengguna, ketersediaan, dan prasyarat

Tindakan ini memengaruhi akun runtime Anda sendiri. Tindakan tersebut tidak menetapkan atau mengubah kredensial portal penagihan my.8labs.id.

Siapkan kata sandi saat ini untuk perubahan sensitif. Sebelum mengaktifkan autentikasi dua faktor, siapkan aplikasi autentikator TOTP dan penyimpanan aman yang terpisah dari perangkat tersebut.

Konfigurasi layanan menentukan ketersediaan pemulihan kata sandi dan daftar sesi. Tidak adanya kontrol pemulihan bukan berarti pendaftaran publik atau undangan memiliki ketersediaan yang sama.

<span id="password"></span>

## Ganti kata sandi

1. Buka **Account → Settings → Password**.
2. Isi kolom kata sandi lalu kirim perubahan.
3. Tunggu konfirmasi atau halaman masuk.
4. Masuk kembali dengan kata sandi baru.

Perubahan kata sandi mengeluarkan Anda dari sesi. Browser lain dengan sesi lama juga harus masuk kembali. Gunakan kata sandi unik yang memenuhi persyaratan pada layar.

<span id="forgotten-it"></span>

### Pulihkan kata sandi yang terlupa

Jika diaktifkan, halaman masuk menyediakan **Forgot your password?**

1. Buka tautan tersebut dan masukkan email akun runtime Anda.
2. Kirim permintaan lalu periksa kotak masuk, termasuk folder spam.
3. Buka tautan pengaturan ulang dan buat kata sandi baru.
4. Masuk kembali dengan kata sandi baru.

Tautan pengaturan ulang yang didokumentasikan berlaku satu jam dan hanya sekali pakai. Pemulihan juga memerlukan pengiriman email yang berfungsi. Email tidak dijamin terkirim jika pemulihan dinonaktifkan atau layanan email tidak tersedia.

Jika tautan tidak ada, kedaluwarsa, atau email tidak diterima, hubungi [dukungan](/id/docs/help/contact). Jangan kirim kata sandi atau tautan pengaturan ulang. Mengatur ulang kata sandi tidak menggantikan faktor kedua yang hilang.

<span id="two-factor-authentication"></span>

## Gunakan autentikasi dua faktor

Autentikasi dua faktor menambahkan kode TOTP enam digit setelah kata sandi saat masuk. Aplikasi yang sesuai antara lain Google Authenticator, 1Password, dan Aegis.

<span id="turning-it-on"></span>

### Aktifkan autentikasi dua faktor

1. Buka **Account → Settings → Two-factor authentication → Turn on**.
2. Konfirmasikan kata sandi saat ini.
3. Pindai kode QR dengan autentikator, atau masukkan kunci penyiapan yang ditampilkan secara manual.
4. Masukkan kode enam digit dari aplikasi lalu pilih **Confirm**.
5. Tunggu konfirmasi berhasil dan simpan kode pemulihan dengan aman.

Faktor kedua baru aktif setelah kode valid dikonfirmasi. Menutup penyiapan yang belum selesai tidak mengaktifkannya. Perlakukan kode QR dan kunci penyiapan sebagai rahasia; jangan bagikan tangkapan layarnya.

<span id="recovery-codes"></span>

### Simpan dan ganti kode pemulihan

Setiap kode pemulihan hanya dapat dipakai sekali untuk masuk dan akan habis setelah digunakan. Simpan terpisah dari perangkat autentikator.

Gunakan **Recovery codes** untuk melihat kumpulan kode saat ini setelah mengonfirmasi kata sandi. Gunakan **Regenerate codes** untuk mengganti seluruh kumpulan setelah mengonfirmasi kata sandi. Segera perbarui salinan simpanan Anda; jangan mengandalkan kode lama.

Jika autentikator dan seluruh kode pemulihan hilang, hubungi dukungan untuk pemulihan melalui operator. Pemulihan memerlukan pemeriksaan identitas; jangan menganggap akses akan langsung diberikan atau pemeriksaan bisa dilewati.

<span id="signing-in-with-it-on"></span>

### Masuk dengan faktor kedua

Setelah memasukkan kata sandi, masukkan kode autentikator saat ini. Jika autentikator tidak tersedia, pilih **Lost your device? Use a recovery code** lalu masukkan kode simpanan yang belum digunakan.

Jika kode gagal, periksa waktu pada perangkat autentikator dan gunakan kode baru. Jangan membagikan atau mengirim kode pemulihan melalui saluran dukungan.

<span id="turning-it-off"></span>

### Nonaktifkan autentikasi dua faktor

Pilih **Turn off** pada kartu yang sama lalu konfirmasikan kata sandi. Konfirmasi kata sandi diperlukan untuk mengaktifkan atau menonaktifkan faktor serta melihat atau membuat ulang kode pemulihan.

Penonaktifan menghapus perlindungan masuk tersebut. Lakukan hanya jika diperlukan, lalu aktifkan kembali setelah berpindah perangkat autentikator.

<span id="active-sessions"></span>

## Tinjau sesi browser aktif

Jika didukung, **Active sessions** menampilkan browser yang masuk beserta alamat IP dan aktivitas terakhir. Anda dapat mencabut sesi lain, tetapi bukan sesi saat ini melalui daftar tersebut.

1. Buka **Account → Settings → Active sessions**.
2. Tinjau entri dan cabut sesi browser yang tidak dikenal.
3. Tunggu daftar diperbarui.
4. Ganti kata sandi jika akses mencurigakan.

Daftar dan pencabutan sesi memerlukan konfigurasi sesi panel berbasis database. Konfigurasi lain menampilkan pemberitahuan, bukan daftar. Pelanggan tidak perlu mengubah konfigurasi platform sendiri.

<span id="stale-sessions"></span>

### Pahami permintaan masuk akibat sesi lama

Panel membandingkan hash kata sandi yang tersimpan dalam sesi dengan hash akun saat ini. Jika berbeda, browser diarahkan ke halaman masuk, bukan dibiarkan mengalami kesalahan 401.

Hal ini dapat terjadi setelah perubahan kata sandi di perangkat lain atau ketika browser sebelumnya masuk ke akun berbeda. Masuk kembali memperbarui sesi. Perlindungan ini tetap berlaku meskipun daftar sesi tidak tersedia.

Jika permintaan masuk yang tidak diharapkan terus terjadi, catat waktu dan kesalahannya lalu hubungi dukungan. Jangan kirim cookie sesi.

<span id="ssh-keys"></span>

## Kelola kunci publik SSH

Buka **Workspace → SSH Keys** pada sidebar untuk mengelola daftar kunci publik tersimpan.

Kunci SSH akun menyimpan **kunci publik** yang dapat dipilih saat deployment, jika didukung, sebagai pengganti kata sandi root. Lihat [akses SSH](/id/docs/getting-started/ssh) dan [mengakses Virtual Labs](/id/docs/getting-started/accessing-virtual-labs).

Jangan pernah mengunggah kunci privat SSH. Jangan menganggap perubahan kunci publik tersimpan otomatis mengubah authorized keys pada server yang sudah dibuat.

## Dugaan pengambilalihan akun

Cabut sesi browser yang tidak dikenal, ganti kata sandi, lalu tinjau [API keys](/id/docs/account/api-keys) dan [akses tim](/id/docs/teams/overview). Mencabut sesi browser tidak sama dengan mencabut API key.

Segera hubungi [dukungan 8Labs](/id/docs/help/contact) jika Anda tidak dapat mengambil kembali kendali. Sertakan identitas akun, waktu kejadian, dan pesan kesalahan yang sudah disamarkan. Jangan bagikan kata sandi, materi penyiapan TOTP, kode pemulihan, token, atau cookie.

<span id="see-also"></span>

## Panduan terkait

- [Personal API keys](/id/docs/account/api-keys)
- [Langganan notifikasi](/id/docs/account/notifications)
- [Undangan dan pendaftaran](/id/docs/teams/invitations)
