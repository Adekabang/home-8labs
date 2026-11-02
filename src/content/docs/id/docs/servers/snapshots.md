---
title: Menggunakan snapshot disk dengan aman
description: Buat checkpoint rantai disk, pulihkan hanya saat server berhenti, dan pahami mengapa snapshot tidak menggantikan backup eksternal.
contentId: servers-snapshots
owner: 8Labs support
reviewedVersion: LabsPanel 5.3.15
reviewedDate: 2026-11-02
translationStatus: translated
---

Snapshot adalah checkpoint pada rantai disk server di suatu waktu. Gunakan untuk kembali ke kondisi disk sebelumnya saat melakukan perubahan terkendali.

**Snapshot bukan backup eksternal.** Snapshot bergantung pada penyimpanan dasar server. Pemulihan setelah node atau penyimpanan hilang memerlukan backup yang sesuai di penyimpanan jarak jauh terpisah.

**Pemulihan membuang perubahan disk setelah checkpoint yang dipilih.** Simpan data terbaru yang diperlukan di tempat lain terlebih dahulu. Menghapus snapshot menghilangkan titik pemulihan tersebut secara permanen.

## Pengguna, ketersediaan, dan prasyarat

Panduan ini untuk pemilik server dan kolaborator berwenang di [cloud.8labs.id](https://cloud.8labs.id). Ketersediaan bergantung pada kuota paket, dukungan penyimpanan, konfigurasi layanan, dan akses.

| Izin               | Tindakan                         |
| ------------------ | -------------------------------- |
| `snapshot.read`    | Melihat daftar snapshot.         |
| `snapshot.write`   | Membuat atau menghapus snapshot. |
| `snapshot.restore` | Memulihkan snapshot.             |

Kontrol daya memerlukan izin tersendiri. Server harus tidak sedang menjalankan operasi lain sebelum pembuatan, pemulihan, atau penghapusan. Pemulihan juga memerlukan status **Stopped**.

Sebelum perubahan berisiko, verifikasi [backup](/id/docs/servers/backups) yang sesuai, pastikan [konsol](/id/docs/servers/console) berfungsi, dan rencanakan konsistensi aplikasi. Checkpoint disk tidak menjamin konsistensi database atau mencakup layanan eksternal.

## Membuat checkpoint

1. Buka halaman **Snapshots** server.
2. Periksa jumlah dan batas yang ditampilkan.
3. Pilih **New snapshot**.
4. Masukkan **Name** yang unik, misalnya `before-upgrade`.
5. Tambahkan **Description** opsional untuk menjelaskan kondisi yang direkam.
6. Pilih **Create snapshot** sekali.
7. Tunggu prosesnya lalu pastikan snapshot muncul dalam daftar.

Nama harus dimulai dengan huruf dan hanya memakai huruf, angka, garis bawah, atau tanda hubung. Batas nama 40 karakter; deskripsi maksimal 255 karakter.

Batas nol menonaktifkan pembuatan. Saat batas tertentu tercapai, hapus hanya checkpoint yang tidak diperlukan atau tanyakan perubahan kuota kepada dukungan. Jumlah tanpa batas tidak menjamin kapasitas fisik tanpa batas.

Hypervisor menjalankan operasi penyimpanan. Permintaan diterima atau notifikasi bukan bukti titik pemulihan telah diuji. Periksa daftar dan laporkan kesalahan berulang sebelum melakukan perubahan berisiko.

## Membaca pohon snapshot

Halaman mengelompokkan snapshot berdasarkan checkpoint induknya. **Active** menunjukkan induk rantai disk saat ini, bukan jaminan snapshot berisi penulisan terbaru Anda.

Gunakan nama, deskripsi, dan waktu untuk memilih titik pemulihan. Jangan hanya mengandalkan posisi pohon atau tanda **Active**.

## Memulihkan snapshot

**Pahami dampak kehilangan data terlebih dahulu.** Tindakan ini mengubah disk server saat ini, bukan membuat server terpisah.

1. Pastikan identitas server dan checkpoint tujuan.
2. Simpan data terbaru yang diperlukan di luar rantai disk ini.
3. Lakukan shutdown dan tunggu **Stopped** serta tidak adanya operasi lain.
4. Pilih **Restore** pada snapshot tujuan.
5. Baca konfirmasi lalu setujui pengembalian kondisi disk.
6. Tunggu status pemulihan menghilang; jangan mengirim permintaan restore kedua.
7. Rollback meminta server tetap berhenti. Pastikan statusnya sebelum memilih **Start**.
8. Setelah startup, periksa OS, aplikasi, dan data yang diharapkan melalui konsol.

Pemulihan berjalan secara asinkron. Pesan bahwa pemulihan dimulai bukan tanda selesai. Jika gagal atau macet, hentikan tindakan destruktif berikutnya dan hubungi dukungan.

## Menghapus checkpoint yang tidak diperlukan

Pilih kontrol hapus snapshot lalu baca **Delete snapshot** dengan teliti. Konfirmasikan hanya setelah memeriksa titik pemulihan yang masih tersisa.

Penghapusan tidak dapat dibatalkan. Hypervisor mengubah induk snapshot anak; menghapus induk tidak berarti semua anaknya terhapus. Tunggu selesai dan tinjau pohon yang dihasilkan.

Jangan menghapus berkas penyimpanan secara langsung atau menganggap penghapusan snapshot sebagai pengganti verifikasi backup.

## Pemecahan masalah dan eskalasi

| Gejala                                   | Langkah aman berikutnya                                                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| “Snapshots aren't included in this plan” | Hubungi dukungan atau tinjau paket. Jangan menganggap semua server menyertakan snapshot.                                  |
| Batas tercapai                           | Periksa jumlah dan titik pemulihan tersisa. Hapus hanya snapshot yang tidak diperlukan atau minta perubahan batas.        |
| Tidak memiliki izin melihat              | Minta `snapshot.read` kepada pemilik; izin restore dan write terpisah.                                                    |
| “Couldn't reach the hypervisor”          | Tunggu lalu gunakan **Retry** sekali. Daftar yang tidak tersedia bukan berarti snapshot terhapus.                         |
| Server harus idle                        | Tunggu instalasi, restore, atau operasi transisi selesai. Jangan memaksa menghapus status.                                |
| Restore memerlukan server berhenti       | Lakukan shutdown terkendali dan pastikan **Stopped**, bukan hanya sesi terputus.                                          |
| Pembuatan gagal pada penyimpanan         | Catat pesan kesalahan dan tanyakan dukungan snapshot atau kapasitas kepada dukungan. Jangan mengubah rantai disk sendiri. |
| Restore terus berlangsung                | Catat checkpoint dan waktu mulai. Minta dukungan memeriksa tugas hypervisor sebelum tindakan lain.                        |

Hubungi [dukungan 8Labs](/id/docs/help/contact) dengan ID server, nama checkpoint, waktu UTC, status, dan pesan kesalahan. Hapus rahasia serta data pelanggan dari bukti yang dilampirkan.

## Panduan terkait

- [Backup dan verifikasi arsip](/id/docs/servers/backups)
- [Tindakan daya server](/id/docs/servers/power)
- [Akses konsol](/id/docs/servers/console)
- [Pengaturan server yang destruktif](/id/docs/servers/settings)
