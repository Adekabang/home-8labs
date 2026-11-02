---
title: Mengelola subuser server
description: Berikan izin tertentu pada satu server kepada akun yang sudah ada tanpa membagikan kredensial Anda.
contentId: teams-subusers
owner: 8Labs support
reviewedVersion: LabsPanel 5.3.15
reviewedDate: 2026-11-02
translationStatus: translated
---

Subuser memperoleh izin tertentu pada satu server. Akses ini tidak bergantung pada organisasi atau proyek.

## Pengguna, ketersediaan, dan prasyarat

Panduan ini ditujukan untuk pemilik server di [cloud.8labs.id](https://cloud.8labs.id). Hanya pemilik server dan root admin platform yang dapat mengelola subuser. Status admin organisasi atau izin `settings.manage` saja tidak memberikan hak tersebut.

Kontrol **Settings → Access** harus tersedia pada layanan. Kolaborator harus sudah memiliki akun runtime. Pastikan email akun dan izin minimum yang diperlukan sebelum melanjutkan.

<span id="subusers-vs-projects"></span>

## Bandingkan subuser dan proyek

| Cara           | Cakupan                        | Lokasi pengelolaan                |
| -------------- | ------------------------------ | --------------------------------- |
| Subuser        | Satu server                    | **Settings → Access** pada server |
| Anggota proyek | Semua server dalam satu proyek | Dialog **Share** pada folder      |

Keduanya memakai [kumpulan izin](/id/docs/teams/projects#permission-set) yang sama. Akses efektif merupakan gabungan seluruh sumber akses yang berlaku.

Pilih subuser jika satu server sudah mencukupi. Pilih [proyek](/id/docs/teams/projects) jika kolaborator yang sama memerlukan akses ke sekumpulan server.

<span id="managing-subusers"></span>

## Tambahkan subuser

1. Buka server tujuan.
2. Buka **Settings → Access**.
3. Pilih tindakan tambah lalu masukkan email akun kolaborator yang sudah terdaftar.
4. Pilih hanya izin yang diperlukan pada pemilih izin.
5. Kirim perubahan dan tunggu daftar subuser diperbarui.
6. Minta kolaborator membuka server melalui akunnya sendiri.

Jangan menambahkan pemilik server sebagai subuser. Pemilik sudah memiliki akses penuh dan tidak dapat ditambahkan ke servernya sendiri.

Jika orang tersebut belum memiliki akun, pembuatan subuser tidak dapat mendaftarkannya. Gunakan [undangan proyek](/id/docs/teams/invitations), jika tersedia, atau hubungi [dukungan](/id/docs/help/contact) mengenai pembuatan akses awal.

## Edit atau hapus subuser

1. Buka **Settings → Access** pada server yang sama.
2. Edit izin subuser lalu simpan, atau pilih tindakan hapus.
3. Tunggu daftar diperbarui atau konfirmasi muncul sebelum meninggalkan halaman.
4. Periksa sumber akses lain jika tujuannya mencabut seluruh akses orang tersebut.

Menghapus subuser hanya menghapus izin langsung itu. Keanggotaan proyek, status pemilik/admin organisasi, atau kepemilikan server masih dapat memberikan akses.

Halaman browser yang sudah terbuka mungkin perlu dimuat ulang agar kontrol sesuai dengan perubahan. Jangan menganggap halaman lama sebagai bukti bahwa izin masih ada.

## Keamanan dan pemecahan masalah

- **Kontrol akses tidak muncul:** pastikan Anda pemilik server. Minta pemilik melakukan perubahan; jangan berbagi kredensialnya.
- **Akun tidak ditemukan:** periksa email runtime. Keberadaan akun penagihan saja tidak membuktikan bahwa akun runtime tersedia.
- **Tindakan yang dibutuhkan tidak tersedia:** bandingkan tindakan dengan izin tersimpan, lalu periksa izin terkait lainnya.
- **Akses masih ada setelah penghapusan:** periksa [gabungan sumber akses](/id/docs/teams/overview#the-access-model-at-a-glance), bukan menghapus baris yang sama berulang kali.

Akses konsol, daya, pemulihan, dan instalasi ulang dapat memengaruhi beban kerja atau data. Berikan setiap izin dengan pertimbangan. Jika mencurigai penyalahgunaan, hapus izin terkait dan hubungi pemilik server atau [dukungan](/id/docs/help/contact). Sertakan identitas server dan waktu kejadian, tanpa kredensial atau keluaran konsol sensitif.

<span id="see-also"></span>

## Panduan terkait

- [Proyek dan pendelegasian akses](/id/docs/teams/projects)
- [Ringkasan tim dan akses](/id/docs/teams/overview)
- [Keamanan akun](/id/docs/account/security)
- [Pengaturan server](/id/docs/servers/settings)
