---
title: Mengelola organisasi
description: Buat ruang kerja tim, kelola peran organisasi, dan beralih antara proyek pribadi dan proyek bersama.
contentId: teams-organizations
owner: 8Labs support
reviewedVersion: LabsPanel 5.3.15
reviewedDate: 2026-11-02
translationStatus: translated
---

Organisasi mengelompokkan orang dan proyek server bersama. Halaman detailnya menampilkan anggota, undangan tertunda, dan proyek dalam satu tempat.

## Pengguna, ketersediaan, dan prasyarat

Gunakan panduan ini sebagai pemilik, admin, atau anggota organisasi di [cloud.8labs.id](https://cloud.8labs.id). Kontrol bergantung pada peran dan konfigurasi layanan. Hubungi [dukungan](/id/docs/help/contact) jika fitur yang dijelaskan tidak tersedia.

Masuk dengan akun runtime Anda sendiri. Pastikan alamat email akun tujuan sebelum menambahkan orang. Pilih nama organisasi yang mudah dikenali tim.

<span id="roles"></span>

## Pahami peran organisasi

| Peran      | Akses dan tanggung jawab                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Owner**  | Pembuat organisasi; hanya satu per organisasi. Mengelola anggota dan pengaturan organisasi, dengan akses penuh ke server organisasi. |
| **Admin**  | Mengelola anggota dan sumber daya organisasi, dengan akses penuh ke server organisasi.                                               |
| **Member** | Hanya mengakses proyek yang diikuti, sesuai izin proyek yang diberikan.                                                              |

Antarmuka pelanggan menyediakan **Rename** dan **Delete** untuk pemilik. Pemilik dan admin dapat menambah anggota, mengubah peran, serta menghapus keanggotaan.

Peran organisasi berlaku pada tingkat tenant. Admin organisasi tidak menjadi root admin platform dan tidak mendapat akses ke area admin platform.

Berbagi proyek dan mengelola anggotanya memiliki batas tersendiri: tindakan ini memerlukan pemilik folder atau operator platform. Status admin organisasi saja tidak memberikan kontrol tersebut pada folder milik orang lain.

<span id="creating-an-organization"></span>

## Buat organisasi

1. Buka **Organizations** pada sidebar.
2. Pilih tindakan pembuatan lalu masukkan nama organisasi.
3. Kirim formulir dan tunggu halaman detail organisasi terbuka.
4. Pastikan peran Anda **Owner** dan nama organisasi sudah benar.

Anda menjadi pemilik setelah pembuatan berhasil. Jika permintaan gagal, baca pesan kesalahan sebelum mengirim ulang.

<span id="managing-members"></span>

## Tambahkan atau perbarui anggota

1. Buka halaman detail organisasi.
2. Masukkan email akun runtime yang sudah ada pada kontrol anggota.
3. Pilih **Admin** atau **Member** sesuai akses yang dibutuhkan.
4. Kirim perubahan dan tunggu daftar anggota diperbarui.
5. Gunakan kontrol peran pada baris anggota untuk mengganti perannya.
6. Gunakan tindakan hapus untuk menghapus keanggotaan.

Untuk orang yang belum memiliki akun, buat [undangan](/id/docs/teams/invitations). Tambahkan akun yang sudah ada secara langsung, bukan dengan undangan baru.

Menambahkan orang ke [proyek](/id/docs/teams/projects) juga menambahkannya sebagai anggota organisasi terkait jika diperlukan. Anda tidak perlu menambahkannya di dua tempat.

**Periksa izin lain saat mengakhiri akses.** Menghapus keanggotaan organisasi belum membuktikan bahwa kepemilikan server, izin proyek, atau akses subuser langsung sudah berakhir. Tinjau semua sumber akses yang berlaku.

<span id="switching-the-active-organization"></span>

## Ganti ruang kerja aktif

1. Buka pemilih ruang kerja pada sidebar.
2. Pilih **Personal** untuk folder pribadi, atau pilih organisasi.
3. Tunggu halaman server menampilkan proyek dan server dari ruang kerja tersebut.
4. Periksa tanda centang aktif dan nama organisasi pada breadcrumb.

Pilihan tersimpan pada browser tersebut. Browser lain dapat menggunakan ruang kerja aktif yang berbeda. Memilih ruang kerja tidak menambah izin.

## Ganti nama atau hapus dengan aman

Sebagai pemilik, buka halaman detail organisasi lalu pilih **Rename** atau **Delete**. Baca konfirmasi sebelum melanjutkan.

Menghapus organisasi melepas kaitan proyeknya; folder dan server tidak dihapus. Struktur akses akan berubah. Koordinasikan dengan tim dan tinjau izin yang akan tersisa sebelum menghapus.

## Pemecahan masalah dan eskalasi

- **Orang tidak bisa ditambahkan:** pastikan email akun runtime benar. Akun yang belum ada memerlukan undangan, jika tersedia.
- **Orang sudah menjadi anggota:** perbarui baris yang ada, bukan menambah keanggotaan baru.
- **Anggota tidak melihat server:** tambahkan ke proyek tujuan, lalu periksa izin dan isi proyek tersebut.
- **Kontrol berbagi proyek tidak muncul:** hubungi pemilik folder; keanggotaan organisasi bukan kepemilikan folder.
- **Daftar server tidak sesuai:** pilih ruang kerja yang benar dan periksa breadcrumb.
- **Akses masih ada setelah penghapusan:** tinjau seluruh [sumber akses](/id/docs/teams/overview#the-access-model-at-a-glance).

Laporkan keanggotaan atau akses yang tidak dikenal kepada pemilik organisasi, lalu [dukungan 8Labs](/id/docs/help/contact) bila diperlukan. Sertakan nama organisasi, identitas sumber daya terkait, dan waktu perubahan. Jangan kirim kata sandi atau token undangan.

<span id="see-also"></span>

## Panduan terkait

- [Ringkasan tim dan akses](/id/docs/teams/overview)
- [Proyek dan pendelegasian akses](/id/docs/teams/projects)
- [Undangan dan pendaftaran](/id/docs/teams/invitations)
- [Subuser server](/id/docs/teams/subusers)
