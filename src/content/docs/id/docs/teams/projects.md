---
title: Proyek dan pendelegasian akses
description: Bagikan folder server dengan organisasi dan berikan izin tertentu kepada anggota proyek.
contentId: teams-projects
owner: 8Labs support
reviewedVersion: LabsPanel 5.3.15
reviewedDate: 2026-11-02
translationStatus: translated
---

Proyek adalah folder server yang ditautkan ke organisasi. Anggota proyek memperoleh izin tertentu pada server di dalamnya.

## Pengguna, ketersediaan, dan prasyarat

Panduan ini ditujukan untuk pemilik folder dan kolaborator di [cloud.8labs.id](https://cloud.8labs.id). Ketersediaan bergantung pada konfigurasi layanan dan izin.

Pemilik folder mengelola tautan organisasi, anggota, dan undangan proyek. Operator platform juga dapat mengelola kontrol ini. Untuk menautkan folder, Anda harus memiliki folder tersebut serta menjadi pemilik atau admin organisasi tujuan.

Siapkan folder, organisasi yang sesuai, dan email akun setiap kolaborator. Status admin organisasi saja tidak mengizinkan Anda mengubah keanggotaan folder orang lain.

<span id="how-access-is-delegated"></span>

## Pilih cakupan yang tepat

- **Keanggotaan proyek** memberikan izin tertentu pada setiap server dalam proyek tersebut.
- **Subuser server** memberikan izin tertentu pada satu server, tanpa bergantung pada organisasi.

Akses efektif pengguna menggabungkan semua izin yang berlaku. Memindahkan server ke proyek mengubah izin proyek yang berlaku pada server itu. Tinjau akses sebelum mengubah isi proyek.

<span id="permission-set"></span>

## Izin yang tersedia

Pemilih izin mengelompokkan izin berdasarkan area dan menyediakan pilihan per kategori.

| Area      | Identitas izin                                        |
| --------- | ----------------------------------------------------- |
| Control   | `control.console`, `control.power`                    |
| Backups   | `backup.read`, `backup.write`, `backup.restore`       |
| Snapshots | `snapshot.read`, `snapshot.write`, `snapshot.restore` |
| Settings  | `settings.manage`, `settings.reinstall`               |
| Firewall  | `firewall.manage`                                     |
| Activity  | `activity.read`                                       |

Pilih hanya tindakan yang diperlukan. Izin pemulihan dan instalasi ulang dapat memungkinkan perubahan destruktif; sepakati kebutuhan pemulihan sebelum memberikannya.

Pemilik server, root admin platform, serta pemilik/admin organisasi terkait memiliki akses wildcard (`*`) secara implisit. Izin proyek yang terbatas tidak mengurangi akses yang lebih luas tersebut. Admin organisasi bukan root admin platform.

<span id="sharing-a-folder-into-an-organization"></span>

## Bagikan folder sebagai proyek

1. Buka halaman server dan cari folder milik Anda.
2. Buka dialog **Share** pada folder tersebut.
3. Pilih organisasi yang Anda miliki atau kelola sebagai admin.
4. Simpan tautan organisasi jika dialog memintanya sebelum tindakan anggota.
5. Ketik nama atau email untuk memilih anggota organisasi yang sudah ada.
6. Untuk akun lain yang sudah terdaftar, masukkan email dan gunakan tindakan penambahan anggota langsung.
7. Pilih izin yang diperlukan lalu simpan.
8. Untuk orang tanpa akun, pilih izin lalu gunakan **Invite link**, jika tersedia.

Menambahkan akun yang sudah ada ke proyek otomatis menambahkannya sebagai **Member** organisasi terkait bila diperlukan. Tindakan ini tidak menaikkan peran organisasi yang sudah ada. Anda tidak perlu menambahkan anggota organisasi secara terpisah.

Undangan berbeda dari keanggotaan yang sudah aktif. Bagikan tautan secara privat dan tunggu penerimaan. Lihat [undangan](/id/docs/teams/invitations).

## Pastikan proses selesai

Tunggu baris anggota tersimpan atau konfirmasi undangan muncul. Minta anggota yang sudah bergabung memilih ruang kerja organisasi dan membuka proyek.

Pastikan server dan tindakan yang tersedia sudah sesuai. Pembuatan keanggotaan tidak menyalakan, menginstal, atau mengubah server itu sendiri.

<span id="editing-or-removing-a-members-access"></span>

## Ubah atau hapus akses

1. Buka kembali dialog **Share** pada folder.
2. Gunakan ikon pensil pada baris anggota untuk mengubah izin, lalu simpan.
3. Gunakan tindakan hapus untuk menghapus keanggotaan proyek tersebut.
4. Tinjau **Pending invites** di bawah daftar anggota.
5. Salin kembali tautan undangan tertunda atau cabut jika tidak lagi diperlukan.

Mencabut undangan membatalkan tautannya; tindakan ini tidak menghapus akses yang sudah diberikan melalui keanggotaan yang diterima.

**Menghapus satu izin proyek tidak mencabut semua sumber akses.** Saat mengakhiri akses, periksa proyek lain, izin subuser langsung, peran organisasi, dan kepemilikan server.

## Pemecahan masalah dan eskalasi

- **Organisasi tidak dapat dipilih:** pastikan Anda pemilik/admin organisasi tersebut dan pemilik folder.
- **Folder harus ditautkan dahulu:** simpan tautan organisasi sebelum menambah anggota atau undangan proyek.
- **Akun tidak ditemukan:** periksa email; gunakan undangan hanya untuk orang yang belum memiliki akun.
- **Pengguna sudah ada atau sudah menjadi anggota:** tambahkan akun langsung atau edit baris anggotanya.
- **Pemilik tidak bisa ditambahkan:** pemilik folder sudah memiliki akses penuh.
- **Akses lebih luas daripada pilihan izin:** tinjau [gabungan sumber akses](/id/docs/teams/overview#the-access-model-at-a-glance).

Jika izin tersimpan tidak sesuai dengan akses yang terlihat, jangan memperluas izin. Hubungi pemilik folder atau [dukungan](/id/docs/help/contact). Sertakan identitas proyek dan server, izin yang dimaksud, serta pesan kesalahan. Jangan sertakan token undangan atau API key.

<span id="see-also"></span>

## Panduan terkait

- [Organisasi](/id/docs/teams/organizations)
- [Subuser server](/id/docs/teams/subusers)
- [Undangan](/id/docs/teams/invitations)
- [Personal API keys](/id/docs/account/api-keys): izin sumber daya yang didelegasikan juga berlaku untuk permintaan API.
- [Folder server](/id/docs/servers/folders)
