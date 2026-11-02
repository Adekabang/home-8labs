---
title: Mengatur server dengan folder
description: Buat folder pribadi, pindahkan dan urutkan server, serta pahami perbedaan folder dengan proyek bersama.
contentId: servers-folders
owner: 8Labs support
reviewedVersion: LabsPanel 5.3.15
reviewedDate: 2026-11-02
translationStatus: translated
---

Folder mengelompokkan server di panel. Folder tidak memindahkan disk virtual, mengubah jaringan server, atau membuat backup.

## Pengguna, ketersediaan, dan prasyarat

Panduan ini ditujukan bagi pemilik server di [cloud.8labs.id](https://cloud.8labs.id). Kontrol folder bergantung pada konfigurasi layanan dan hak akses Anda.

Masuk lalu pilih ruang kerja pribadi atau organisasi yang benar. Anda dapat menempatkan server milik sendiri dalam folder milik sendiri. Akses proyek bersama tidak berarti Anda memiliki server tersebut.

Sebelum memindahkan server ke proyek bersama, periksa anggota dan izin proyek. Anggotanya dapat memperoleh akses ke server di proyek itu.

<span id="creating-and-using-folders"></span>

## Membuat, membuka, dan memindahkan

1. Buka daftar server pada ruang kerja yang dituju.
2. Pilih **New folder** di atas daftar kartu server.
3. Isi **Name** yang mudah dikenali, maksimal 60 karakter.
4. Pilih **Create** lalu tunggu hingga folder muncul.
5. Pilih folder untuk membuka daftar servernya.
6. Seret kartu server ke folder untuk menempatkannya di sana.
7. Gunakan breadcrumb untuk kembali ke tingkat paling atas.
8. Seret kartu server ke akar breadcrumb untuk mengeluarkannya dari folder.

Tunggu setiap perubahan selesai sebelum memindahkan server lagi. Buka folder tujuan dan pastikan server yang dimaksud muncul. Pemindahan yang gagal bukan bukti bahwa server terhapus.

### Mengganti nama atau menghapus folder pribadi

Buka menu **⋯** folder lalu pilih **Rename** atau **Delete**. Kontrol pengelolaan hanya muncul jika hak akses Anda mengizinkannya.

Menghapus folder pribadi memindahkan servernya ke tingkat paling atas, bukan menghapus server. Bedakan tindakan ini dari **Delete Server** di pengaturan server.

Untuk proyek yang terhubung ke organisasi, tinjau dampaknya terhadap akses bersama sebelum menghapus atau mengubah proyek. Baca [panduan proyek](/id/docs/teams/projects).

<span id="sorting"></span>

## Mengurutkan daftar server

Gunakan kontrol pengurutan untuk memilih terbaru, terlama, nama A–Z, atau nama Z–A. Pengurutan hanya mengubah tampilan daftar, bukan operasi atau izin server.

Periksa folder dan ruang kerja aktif saat mencari server. Pengurutan tidak menampilkan server di luar hak akses Anda.

<span id="folders-vs-projects"></span>

## Memahami folder dan proyek

Folder biasa mengatur server milik Anda sendiri. Menghubungkan folder ke organisasi mengubahnya menjadi proyek dengan akses bersama yang dibatasi izin.

Gunakan folder pribadi untuk pengelompokan pribadi. Gunakan proyek jika kolaborator memerlukan izin tertentu pada seluruh server di dalamnya. Nama folder bukan kebijakan akses.

Baca [Proyek](/id/docs/teams/projects) dan [Organisasi](/id/docs/teams/organizations) sebelum menggunakan **Share…** atau mengubah keanggotaan organisasi.

## Pemecahan masalah dan eskalasi aman

| Gejala                                              | Langkah aman berikutnya                                                                                                   |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Server tampak hilang                                | Kembali ke akar breadcrumb. Periksa ruang kerja, folder, dan pengurutan. Tanyakan kepada pemilik apakah akses berubah.    |
| Server gagal diseret                                | Pastikan Anda memiliki server dan folder tujuan. Jangan berulang kali mencoba memindahkan server milik kolaborator.       |
| Menu ganti nama atau hapus tidak tersedia           | Akses Anda tidak mencakup pengelolaan folder. Hubungi pemilik folder atau pengelola organisasi.                           |
| Folder baru belum muncul                            | Tunggu permintaan selesai, lalu muat ulang daftar sekali. Catat pesan kesalahan sebelum mencoba lagi.                     |
| Anggota proyek memiliki akses yang tidak diharapkan | Periksa semua izin proyek, organisasi, dan subuser yang berlaku. Mencabut satu izin tidak mencabut izin dari sumber lain. |

Hubungi [dukungan 8Labs](/id/docs/help/contact) jika pemindahan yang sah tetap gagal. Sertakan identitas server, nama folder, ruang kerja, waktu, dan pesan kesalahan. Jangan kirim kata sandi atau kunci privat.

<span id="see-also"></span>

## Panduan terkait

- [Ringkasan server](/id/docs/servers/overview)
- [Proyek](/id/docs/teams/projects)
- [Organisasi](/id/docs/teams/organizations)
- [Ringkasan tim dan akses](/id/docs/teams/overview)
