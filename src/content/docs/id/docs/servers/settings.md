---
title: Mengubah pengaturan server dengan aman
description: Ubah identitas, autentikasi tamu, media, dan urutan boot dengan pengamanan jelas untuk reinstall atau penghapusan server.
contentId: servers-settings
owner: 8Labs support
reviewedVersion: LabsPanel 5.3.15
reviewedDate: 2026-11-02
translationStatus: translated
---

**Reinstall menghapus data server. Penghapusan menghancurkan VM, data, backup, dan snapshot, serta melepas alamat IP. Tindakan ini tidak dapat dibatalkan.** Ekspor dan verifikasi data yang diperlukan secara independen sebelum melakukannya. Jangan reinstall atau menghapus server untuk memecahkan kesalahan tampilan.

Penghapusan tidak otomatis mengembalikan sisa waktu prabayar. Penagihan pelanggan dikelola di [my.8labs.id](https://my.8labs.id); tanyakan peninjauan tagihan atau persyaratan pembatalan layanan kepada dukungan.

## Pengguna, izin, dan prasyarat

Panduan ini untuk pemilik dan kolaborator berwenang di [cloud.8labs.id](https://cloud.8labs.id). Kartu, templat, ISO, informasi tagihan, dan kontrol penghapusan bergantung pada akses serta konfigurasi layanan.

| Akses                                        | Cakupan                                                                                                                 |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `settings.manage`                            | Nama/hostname server, IPv4 utama, nameserver, autentikasi, media ISO, dan urutan boot.                                  |
| `settings.reinstall`                         | Reinstall dari templat yang tersedia.                                                                                   |
| Kepemilikan server dan kelayakan penghapusan | Penghapusan pelanggan hanya untuk pemilik dan bergantung pada konfigurasi penagihan. Izin settings bukan hak menghapus. |
| Izin daya dan konsol terpisah                | Shutdown, startup, dan pemulihan melalui konsol.                                                                        |

Pastikan identitas server, catat konfigurasi saat ini, dan uji [akses konsol](/id/docs/servers/console). Siapkan waktu penghentian sebelum mengubah akses tamu atau perilaku boot.

## Menemukan bagian yang benar

Buka halaman **Settings** server. Tab yang tersedia adalah **General**, **Security**, dan **Access**.

- **General** berisi identitas, informasi penagihan jika tersedia, jaringan, media, urutan boot, dan kontrol penghapusan yang memenuhi syarat.
- **Security** berisi **Authentication** dan, jika diizinkan, **Reinstall Server**.
- **Access** mengelola akses server yang didelegasikan. Baca [Subuser](/id/docs/teams/subusers), bukan membagikan kredensial.

Kartu yang tidak muncul dapat disebabkan izin atau ketersediaan layanan. Jangan melewati pembatasan akses panel.

## Mengubah nama tampilan atau hostname

1. Buka **Settings → General → Server Name**.
2. Tinjau nama tampilan dan hostname saat ini.
3. Masukkan nilai yang dituju lalu pilih **Save**.
4. Tunggu konfirmasi dan periksa nilai tersimpan.
5. Jika hostname berubah, periksa hostname efektif di sistem tamu secara terpisah.

Nama tampilan mengenali server di panel. Pembaruan hostname juga mengubah konfigurasi cloud-init; nilai tersimpan belum membuktikan tamu yang sedang berjalan menerapkannya. Kedua kolom tidak menerbitkan catatan DNS domain.

## Mengubah pengaturan jaringan

Gunakan **General → Primary IP** untuk memilih IPv4 yang dialokasikan. Gunakan **Nameservers** untuk mengubah IP resolver DNS tamu. Baca [pengaturan jaringan](/id/docs/servers/network) sebelum mengubahnya.

Penerapan nameserver berbeda menurut tamu: Linux memerlukan shutdown lalu startup, bukan **Restart**; Windows perlu tetap menyala agar pembaruan diterapkan. Pastikan hasilnya di dalam tamu.

Pilihan IP utama adalah metadata beserta sinkronisasi cloud-init, bukan bukti rute tamu aktif. Pengaturan jaringan tidak membuat aturan gateway NAT.

## Memperbarui autentikasi sistem tamu

**Authentication** mengubah akses OS tamu, bukan kata sandi akun panel runtime atau akun penagihan. Pertahankan konsol dan sesi lama hingga kredensial baru berfungsi.

1. Buka **Settings → Security → Authentication**.
2. Pilih metode kata sandi atau kunci SSH yang ditawarkan untuk tamu Anda.
3. Masukkan kata sandi kuat dan unik, atau kunci publik SSH yang diperlukan.
4. Gunakan **Insert saved key** jika kunci publik tersimpan yang sesuai tersedia.
5. Simpan kredensial yang dibuat secara aman sebelum menyimpan perubahan.
6. Pilih **Save** dan baca pemberitahuan penerapan.
7. Ikuti persyaratan tamu berikut lalu uji login baru pada sesi terpisah.

Jangan pernah menempelkan kunci privat. Pertahankan metode pemulihan yang sah sebelum mengganti atau menghapus kunci lama. Pengaturan kunci SSH tidak memasang atau mengaktifkan layanan SSH dengan sendirinya.

### Menunggu kredensial diterapkan

- **Kata sandi:** QEMU guest agent aktif dapat menerapkan pembaruan kata sandi Linux dan Windows yang didukung saat berjalan. Tanpanya, lakukan shutdown lalu startup untuk cloud-init; **Restart** tidak setara.
- **Kunci SSH di Linux:** Lakukan shutdown lalu startup; jangan gunakan **Restart** untuk jalur pembaruan ini.
- **Kunci SSH di Windows:** Biarkan server menyala agar mekanisme pembaruan yang dikonfigurasi dapat menerapkannya. Dukungan tamu dan konfigurasi layanan tetap berpengaruh.

Penyimpanan sukses bukan bukti login berhasil. Jika kredensial baru gagal, gunakan konsol dan hubungi dukungan sebelum terus meresetnya. Jangan kirim kata sandi atau kunci privat melalui tiket.

## Memasang media dan mengatur perangkat boot

Gunakan **Mountable ISOs** hanya untuk instalasi atau pemulihan yang Anda pahami. Media disediakan operator; kartu yang ditinjau bukan fasilitas unggah ISO sembarang.

1. Catat urutan boot dan pastikan konsol berfungsi.
2. Buka **Settings → General → Mountable ISOs**.
3. Pilih **Mount** pada media tujuan lalu tunggu status terpasang.
4. Tinjau **Boot Device Configuration**.
5. Masukkan perangkat yang diperlukan ke **Active Boot Devices** lalu seret ke urutan tujuan.
6. Tunggu hasil setiap penyimpanan sebelum perubahan berikutnya.
7. Saat boot yang direncanakan, periksa konsol sebelum menyetujui tindakan installer.
8. Setelah pemulihan, pilih **Unmount** lalu kembalikan urutan boot normal.

Penambahan, penghapusan, dan penyeretan perangkat boot langsung menyimpan perubahan. Mengeluarkan perangkat dari urutan boot bukan menghapus disknya. Tanpa perangkat boot, startup normal tidak dapat berlangsung.

Media instalasi dapat menyediakan alat penghapusan disk. Memasang media bukan persetujuan menghapus disk. Jika pembaruan gagal, muat ulang urutan tersimpan sebelum perubahan lain karena tampilan dapat berubah secara optimistis.

### Menerapkan perubahan hardware tertunda

Jika panel melaporkan perubahan spesifikasi CPU, RAM, atau disk tertunda, lakukan shutdown terkendali lalu startup. **Restart** tidak menerapkan jalur perubahan tertunda ini.

Pemberitahuan tersebut tidak memberikan hak mengubah sumber daya sesuka hati. Periksa paket dan [panduan penagihan](/id/docs/billing-plans/overview); verifikasi sumber daya efektif dalam tamu setelah startup.

## Reinstall dari templat

**Semua data server akan terhapus. Jangan lanjutkan tanpa data pemulihan terpisah yang telah diverifikasi dan persetujuan penghentian layanan.** Snapshot pada server ini bukan salinan pengaman independen.

1. Pastikan identitas server dan sistem operasi tujuan.
2. Buka **Settings → Security → Reinstall Server**.
3. Pilih grup templat yang tersedia dan **Template**.
4. Pilih metode autentikasi yang dituju.
5. Masukkan kata sandi baru atau setidaknya satu kunci publik SSH valid sesuai persyaratan.
6. Simpan kredensial yang dipilih secara aman.
7. Tentukan apakah **Start Server After Completing Installation** perlu diaktifkan.
8. Buka dan baca **Confirm Reinstallation**.
9. Konfirmasikan hanya setelah memeriksa kembali peringatan penghapusan dan server tujuan.
10. Tunggu instalasi selesai. Jangan kirim reinstall kedua saat proses berjalan.
11. Periksa status akhir dan daya, lalu verifikasi OS baru melalui konsol.

Reinstall berjalan asinkron; **installing** berarti masih diproses, bukan instalasi selesai. Pilihan templat bergantung pada node server dan katalog layanan. Metadata OS templat belum menjadi pengamatan guest agent terbaru.

Jika instalasi gagal, simpan pesan kesalahan lalu hubungi dukungan. Jangan berganti-ganti templat atau mengulang reinstall sebelum penyebabnya dipahami.

## Menghapus server yang memenuhi syarat

**Penghapusan menghancurkan VM, data, backup, dan snapshot secara permanen, serta melepas alamat IP. Tidak ada pengembalian dana otomatis.** Jangan mengandalkan titik pemulihan yang ikut terhapus.

1. Simpan dan verifikasi data yang diperlukan di luar sumber daya terkelola server ini.
2. Pastikan konsekuensi layanan dan tagihan kepada dukungan jika ragu.
3. Pastikan kepemilikan serta identitas server yang tepat.
4. Buka **Settings → General → Delete Server** jika tersedia.
5. Pilih **Delete server** dan baca seluruh peringatan.
6. Ketik nama server persis hanya jika penghapusan permanen memang diinginkan.
7. Konfirmasikan sekali, tunggu hasilnya, lalu kembali ke daftar server.

Server yang dikelola operator tanpa paket penagihan memerlukan penghapusan administrator. Kontrol yang tidak tersedia bukan perintah menghapus disk tamu secara manual.

UI kembali ke daftar setelah permintaan penghapusan diterima. Jika muncul kesalahan atau status tidak konsisten, hubungi dukungan sebelum mengulanginya. Jangan menganggap penghapusan server runtime membatalkan layanan penagihan pelanggan yang terpisah.

## Pemecahan masalah dan eskalasi

| Gejala                                                              | Langkah aman berikutnya                                                                                          |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Kartu pengaturan tidak muncul                                       | Pastikan ruang kerja, server, izin terkait, dan ketersediaan layanan kepada pemilik atau dukungan.               |
| **Save** nonaktif                                                   | Periksa apakah nilai berubah dan kolom wajib valid. Jangan mengubah pengaturan lain hanya untuk mengaktifkannya. |
| Hostname, DNS, atau autentikasi tersimpan tetapi tamu belum berubah | Ikuti jalur penerapan terkait. Periksa guest agent/cloud-init melalui konsol sebelum menjadwalkan penghentian.   |
| Login baru gagal                                                    | Pertahankan sesi lama dan konsol. Periksa pengguna tamu, metode kredensial, layanan, dan penyelesaian penerapan. |
| Daftar boot berubah setelah penyimpanan gagal                       | Muat ulang konfigurasi tersimpan sebelum mengedit lagi. Jangan menganggap tampilan optimistis sudah tersimpan.   |
| Peringatan hardware tertunda tetap ada                              | Pastikan siklus shutdown/start penuh selesai, lalu minta dukungan memeriksa sumber daya efektif.                 |
| Tidak ada templat atau ISO                                          | Ketersediaan bergantung pada node/katalog. Hubungi dukungan; jangan memakai media pemulihan tidak tepercaya.     |
| Reinstall pending atau gagal                                        | Catat ID server, templat, waktu, dan kesalahan. Hindari permintaan destruktif lain.                              |
| Hapus tidak tersedia atau gagal                                     | Pastikan pemilik dan kelayakan layanan. Hubungi dukungan; jangan menghancurkan disk untuk melewati kontrol.      |

Hubungi [dukungan 8Labs](/id/docs/help/contact) dengan ID server, waktu UTC, pesan kesalahan, dan pengaturan terkait. Sensor rahasia. Jangan kirim kata sandi, kunci privat, atau tautan arsip sementara.

## Panduan terkait

- [Backup](/id/docs/servers/backups)
- [Snapshot](/id/docs/servers/snapshots)
- [Pengaturan jaringan](/id/docs/servers/network)
- [Tindakan daya](/id/docs/servers/power)
- [Keamanan akun](/id/docs/account/security)
- [Subuser](/id/docs/teams/subusers)
