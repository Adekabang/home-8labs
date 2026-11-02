---
title: Ringkasan tim dan akses
description: Pahami gabungan peran organisasi, izin proyek, dan subuser server di LabsPanel.
contentId: teams-overview
owner: 8Labs support
reviewedVersion: LabsPanel 5.3.15
reviewedDate: 2026-11-02
translationStatus: translated
---

Bagikan akses melalui akun masing-masing, bukan dengan membagikan kata sandi. LabsPanel menggabungkan kepemilikan, peran organisasi, keanggotaan proyek, dan izin subuser server.

## Pengguna dan ketersediaan

Panduan ini ditujukan untuk pemilik server, pengelola tim, dan kolaborator di [cloud.8labs.id](https://cloud.8labs.id). Kontrol tim bergantung pada izin dan konfigurasi layanan. Jika kontrol tidak tersedia, hubungi pemilik organisasi atau [dukungan 8Labs](/id/docs/help/contact).

Sebelum mengubah akses, tentukan pemilik server, calon kolaborator, dan tindakan minimum yang dibutuhkan setiap orang.

<span id="the-access-model-at-a-glance"></span>

## Cara menentukan akses efektif

Izin efektif pengguna merupakan **gabungan** semua sumber akses yang berlaku. Izin yang terbatas dari satu sumber tidak mengurangi izin yang lebih luas dari sumber lain.

| Sumber akses                  | Cakupan dan dampak                                                     |
| ----------------------------- | ---------------------------------------------------------------------- |
| Pemilik server                | Kontrol penuh atas server miliknya.                                    |
| Root admin platform           | Kontrol operator atas server; bukan peran organisasi pelanggan.        |
| Subuser server                | Izin tertentu pada satu server.                                        |
| Pemilik atau admin organisasi | Akses penuh ke server yang terkait dengan organisasi tersebut.         |
| Anggota organisasi            | Akses melalui proyek yang diikutinya, bukan seluruh server organisasi. |
| Keanggotaan proyek            | Izin tertentu pada setiap server dalam proyek itu.                     |

Pemilik, root admin platform, serta pemilik/admin organisasi yang terkait memiliki akses wildcard (`*`) secara implisit. Kolaborator lain memperoleh izin dari seluruh sumber akses yang berlaku.

**Admin organisasi bukan root admin platform.** Peran organisasi tidak memberi akses ke area admin platform.

Misalnya, menghapus `control.power` dari izin proyek tidak mencegah tindakan daya jika pengguna masih mendapat izin tersebut sebagai subuser. Menghapus satu keanggotaan belum membuktikan bahwa seluruh akses sudah berakhir.

## Pilih cara berbagi akses

1. Gunakan [organisasi](/id/docs/teams/organizations) untuk mengelola tim dan ruang kerjanya.
2. Gunakan [proyek](/id/docs/teams/projects) untuk memberikan izin tertentu pada sekumpulan server dalam folder.
3. Gunakan [subuser server](/id/docs/teams/subusers) untuk berbagi satu server tanpa bergantung pada organisasi.
4. Tambahkan akun yang sudah ada secara langsung. Gunakan [undangan](/id/docs/teams/invitations) untuk orang yang belum memiliki akun.
5. Gunakan [personal API keys](/id/docs/account/api-keys) untuk skrip, bukan kredensial browser orang lain.

Keanggotaan proyek juga menambahkan pengguna sebagai anggota organisasi terkait jika diperlukan. Pengguna tersebut tidak otomatis menjadi admin organisasi.

## Pastikan hasil perubahan

Tunggu konfirmasi penyimpanan atau penerimaan sebelum menutup dialog. Undangan belum memberikan akses sampai diterima.

Minta kolaborator memilih ruang kerja yang benar dan membuka server tujuan. Pastikan kontrol yang dibutuhkan tersedia. Jangan menambahkan izin hanya untuk melewati kesalahan yang belum dipahami.

## Atasi masalah akses dengan aman

- **Server tidak muncul:** periksa ruang kerja aktif, keanggotaan proyek, dan apakah server masih berada dalam proyek tersebut.
- **Kontrol tidak tersedia:** bandingkan izin yang dibutuhkan dengan semua izin aktif. Beberapa tindakan pengelolaan tetap khusus pemilik.
- **Akses tetap ada setelah penghapusan:** periksa kepemilikan server, peran organisasi, keanggotaan proyek, dan izin subuser langsung.
- **Orang baru tidak bisa bergabung:** periksa apakah akun sudah ada. Ketersediaan pendaftaran dan undangan bergantung pada penerapan layanan.

Jika mencurigai akses tanpa izin, hapus pemberian akses terkait dan tinjau [keamanan akun](/id/docs/account/security). Hubungi dukungan jika akses tingkat platform atau izin yang tidak dikenal perlu diselidiki. Sertakan identitas sumber daya dan waktu kejadian, bukan kata sandi atau token.

<span id="in-this-section"></span>

## Panduan terkait

- [Mengelola organisasi](/id/docs/teams/organizations)
- [Berbagi proyek dan memilih izin](/id/docs/teams/projects)
- [Mengelola subuser server](/id/docs/teams/subusers)
- [Membuat dan menerima undangan](/id/docs/teams/invitations)
- [Mengamankan akun](/id/docs/account/security)
- [Mengelola personal API keys](/id/docs/account/api-keys)
- [Mengatur server dalam folder](/id/docs/servers/folders)
- [Mengelola jaringan server](/id/docs/servers/network)
- [Mengelola backup](/id/docs/servers/backups)
- [Tagihan dan paket](/id/docs/billing-plans/overview)
