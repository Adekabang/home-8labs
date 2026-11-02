---
title: Undangan dan pendaftaran
description: Undang pengguna runtime baru ke organisasi atau proyek, kelola tautan tertunda, dan terima akses dengan aman.
contentId: teams-invitations
owner: 8Labs support
reviewedVersion: LabsPanel 5.3.15
reviewedDate: 2026-11-02
translationStatus: translated
---

Undangan memungkinkan seseorang bergabung ke organisasi atau proyek tertentu. Undangan juga dapat membuat akun runtime jika orang tersebut belum memilikinya.

## Pengguna, ketersediaan, dan prasyarat

Panduan ini ditujukan untuk pengelola tim dan penerima undangan di [cloud.8labs.id](https://cloud.8labs.id). Ketersediaan pada layanan bergantung pada konfigurasi.

**Pendaftaran tidak selalu hanya melalui undangan.** Pendaftaran publik dapat diaktifkan secara terpisah. Pemulihan kata sandi juga memiliki pengaturan tersendiri. Tidak adanya tautan pendaftaran publik belum membuktikan apakah undangan tersedia.

Undangan organisasi memerlukan pemilik atau admin organisasi. Undangan proyek memerlukan pemilik folder atau operator platform, dan folder harus sudah ditautkan ke organisasi. Status admin organisasi saja tidak mengizinkan undangan pada proyek milik orang lain.

Pastikan email penerima serta peran atau izin yang akan diberikan. Undangan baru hanya untuk **alamat email yang belum terdaftar**. Tambahkan akun yang sudah ada secara langsung melalui kontrol anggota organisasi atau proyek.

<span id="how-it-works"></span>

## Pahami alur undangan

1. Pengelola yang berwenang membuat undangan untuk sebuah alamat email.
2. Undangan berisi peran organisasi atau kumpulan izin proyek.
3. Panel menghasilkan tautan sekali pakai `/invite/{token}`, berlaku selama tujuh hari.
4. Penerima membuka tautan dan menyelesaikan penerimaan.
5. Penerimaan undangan proyek juga menambahkan pengguna sebagai anggota organisasi terkait bila diperlukan.

Alur undangan yang didokumentasikan menyediakan tautan untuk disalin dan dibagikan secara manual. Jangan menganggap email undangan dikirim otomatis.

Seseorang mungkin sudah membuat akun saat menerima undangan yang dibuat sebelumnya. Mereka harus masuk dengan akun yang sesuai dengan email undangan.

<span id="creating-an-invite"></span>

## Buat dan bagikan undangan

### Undangan organisasi

1. Buka halaman detail organisasi.
2. Masukkan email penerima baru.
3. Pilih **Admin** atau **Member** sesuai kebutuhan.
4. Pilih **Invite link** dan tunggu konfirmasi bahwa tautan disalin.
5. Bagikan tautan secara privat kepada penerima yang dimaksud.

### Undangan proyek

1. Buka dialog **Share** pada folder.
2. Pastikan folder ditautkan ke organisasi yang benar.
3. Masukkan email penerima yang belum terdaftar.
4. Pilih izin yang diperlukan.
5. Pilih **Invite link** lalu bagikan tautannya secara privat.

Membuat undangan belum langsung memberikan akses. Tunggu penerimaan sebelum menganggap proses bergabung selesai.

<span id="pending-invites"></span>

## Kelola undangan tertunda

Buka **Pending invites** pada halaman detail organisasi atau dialog **Share** proyek. Gunakan tindakan salin tautan untuk membagikan kembali undangan yang sama. Gunakan tindakan pencabutan untuk segera membatalkan tautan tertunda.

Jika tautan kedaluwarsa, buat undangan pengganti. Mencabut undangan tertunda tidak menghapus keanggotaan yang sudah diterima atau mencabut sumber akses lainnya.

<span id="accepting-an-invite"></span>

## Terima undangan

1. Pastikan Anda memang menunggu undangan dan mengenali pengirimnya.
2. Buka tautan dan periksa alamat pada browser sebelum memasukkan kredensial.
3. Periksa organisasi atau proyek tujuan serta email penerima pada halaman undangan.
4. Jika belum memiliki akun, masukkan nama dan buat kata sandi sesuai persyaratan yang ditampilkan.
5. Jika sudah memiliki akun, masuk dengan email yang sesuai lalu konfirmasikan penerimaan.
6. Tunggu hingga berhasil, lalu pilih ruang kerja organisasi dan buka proyek atau server tujuan.

Penerimaan oleh pengguna baru membuat akun sekaligus memberikan akses undangan. Tautan hanya sekali pakai dan kedaluwarsa setelah tujuh hari. Tautan kedaluwarsa, dicabut, atau sudah dipakai tidak dapat memberikan keanggotaan lagi.

## Pemecahan masalah dan eskalasi aman

- **“That user already has an account” saat membuat undangan:** tambahkan akun secara langsung, bukan membuat undangan lain.
- **Akun sudah ada saat pendaftaran:** masuk lalu terima undangan yang sama dengan email tersebut.
- **Pesan email berbeda:** keluar dari akun runtime yang salah, lalu masuk dengan akun penerima undangan.
- **Tautan kedaluwarsa atau tidak valid:** minta pengirim memeriksa status dan menerbitkan pengganti bila sesuai.
- **Tautan salinan tidak tersedia:** gunakan tindakan salin pada undangan tertunda. Jangan memublikasikan token dalam tiket dukungan.
- **Sudah bergabung tetapi server tidak terlihat:** periksa ruang kerja, keanggotaan proyek, izin, dan isi proyek.

Perlakukan tautan undangan sebagai rahasia. Jika salah dibagikan, cabut tautan tertunda dan tinjau penerima serta izinnya. Hubungi pengirim atau [dukungan 8Labs](/id/docs/help/contact) jika masalah akses belum selesai. Sertakan nama tujuan, pesan kesalahan, dan waktu, tanpa token atau kata sandi.

<span id="see-also"></span>

## Panduan terkait

- [Organisasi](/id/docs/teams/organizations)
- [Proyek dan pendelegasian akses](/id/docs/teams/projects)
- [Keamanan dan pemulihan akun](/id/docs/account/security)
- [Model akses tim](/id/docs/teams/overview)
