---
title: "Temukan server dan ruang kerja"
description: "Pahami kepemilikan, navigasi, izin, dan status server."
contentId: "customer-servers-overview"
owner: "8Labs support"
reviewedVersion: "LabsPanel 6.0.7"
reviewedDate: "2026-11-13"
translationStatus: "translated"
---

**Pembaca:** semua pengguna Cloud Panel yang diberi izin. Inventaris hanya menampilkan sumber daya yang dapat diakses akun Anda.

![Dropdown pemilik resource Personal terbuka di bawah tombol mode Workspace dan Admin.](../../../../../assets/docs/workspace-owner-orientation.webp)

_Mode Workspace dan kepemilikan sumber daya merupakan kontrol yang terpisah._

## Pilih mode dan kepemilikan secara terpisah

Mode **Workspace** digunakan untuk tugas pelanggan.
Mode **Admin** hanya untuk operator platform yang berwenang dan memakai **Entire platform**.
Pemilih kepemilikan memilih **Personal** atau organisasi dalam mode Workspace.
Admin organisasi bukan administrator platform. Pergantian konteks tidak menambah kewenangan.

1. Buka **Workspace** untuk tugas pelanggan.
2. Pilih **Personal** atau organisasi yang dituju.
3. Buka **Servers**.
4. Cari server atau buka foldernya.
5. Pilih server.

Jika inventaris kosong, periksa ruang kerja dan akses delegasi sebelum menganggap server telah dihapus.
Gunakan [folder](/id/docs/servers/folders/) untuk pengelompokan dan [proyek](/id/docs/teams/projects/) untuk berbagi akses.

![Grid Servers berisi empat kartu server contoh dan navigasi Workspace.](../../../../../assets/docs/workspace-server-inventory.webp)

_Daftar server dan navigasi Workspace._

## Gunakan navigasi lokal server

| Bagian                  | Tugas                                                              |
| ----------------------- | ------------------------------------------------------------------ |
| **Overview**            | Periksa status, kemajuan instalasi, alamat, dan kontrol daya.      |
| **Console**             | Buka sesi grafis atau serial yang diizinkan.                       |
| **Backups & snapshots** | Periksa titik pemulihan serta tindakan yang didukung.              |
| **Firewall**            | Periksa aturan sebelum mengubah jangkauan jaringan tamu.           |
| **Telemetry**           | Periksa pengamatan sumber daya dan rentang waktu.                  |
| **Activity**            | Periksa tindakan dan kegagalan yang dicatat.                       |
| **Settings**            | Periksa konfigurasi, akses, instal ulang, dan pilihan penghapusan. |

Gunakan pemilih sumber daya yang diizinkan untuk berpindah server tanpa tertukar bagian lokalnya.
Gunakan **All servers** untuk kembali ke inventaris. Pastikan nama server sebelum melakukan perubahan.
Sebagian bagian dan kontrol bergantung pada izin, dukungan host, serta hak layanan.

![Overview server contoh dengan kartu CPU, memori, disk, uptime, dan penggunaan resource.](../../../../../assets/docs/server-overview.webp)

_Ringkasan server, penggunaan sumber daya, dan navigasi lokal._

## Baca status sebelum bertindak

Permintaan yang diterima Panel dapat tetap mengantre atau sibuk saat diproses host.
Tunggu operasi saat ini dan status akhirnya sebelum mengirim tindakan lain.
Pengamatan kedaluwarsa atau tidak diketahui tidak membuktikan mesin mati.
Baca [telemetri dan aktivitas](/id/docs/servers/telemetry/) serta [pemecahan masalah](/id/docs/troubleshooting/overview/).

Administrator root dapat memakai **View as customer** dari halaman admin server.
**Configure server** tersedia di atas bagian server, baik pada tampilan server biasa maupun pratinjau admin.
Tautan ini mempertahankan tujuan kembali admin lokal yang tervalidasi (`returnTo`). Jika tidak tersedia, tautan membuka halaman admin server tersebut.
Tautan ini tidak mengubah izin. Pelanggan tidak mendapat akses area admin melalui tautan tersebut.
