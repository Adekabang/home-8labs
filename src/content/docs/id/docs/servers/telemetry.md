---
title: Membaca telemetri dan aktivitas server
description: Pahami kesegaran data langsung, riwayat CPU dan memori, throughput jaringan serta disk, dan batas catatan aktivitas.
contentId: servers-telemetry
owner: 8Labs support
reviewedVersion: LabsPanel 5.3.15
reviewedDate: 2026-11-02
translationStatus: translated
---

Telemetri menggambarkan penggunaan sumber daya yang teramati. Data ini membantu investigasi, bukan bukti aplikasi sehat atau semua koneksi berhasil.

## Pengguna, ketersediaan, dan prasyarat

Panduan ini untuk pemilik dan kolaborator dengan akses server di [cloud.8labs.id](https://cloud.8labs.id). Metrik bergantung pada hypervisor, riwayat yang tersedia, dan konfigurasi layanan.

Membaca **Activity** memerlukan `activity.read`. Melihat sumber daya tidak memberikan izin daya, firewall, atau pengaturan.

Pilih server yang benar dan catat waktu kejadian beserta zona waktunya. Gunakan pemeriksaan kesehatan aplikasi terpisah jika ketersediaan layanan penting.

## Memeriksa pembacaan langsung dan kesegarannya

1. Buka **Overview** server.
2. Baca nilai CPU dan memori bersama label kesegaran datanya.
3. Periksa **Updated at** sebelum membandingkan nilai dengan kejadian.
4. Aktifkan tab browser jika sebelumnya tidak digunakan.
5. Tunggu pembacaan baru sebelum menyimpulkan penggunaan saat ini berubah.

| Label                         | Penafsiran                                                                                                       |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Waiting**                   | Tampilan ini belum menerima pembacaan telemetri. Ini bukan pengukuran penggunaan nol.                            |
| **Live**                      | Tampilan baru menerima pembacaan. Ini bukan jaminan uptime aplikasi.                                             |
| **Stale**                     | Pembacaan terakhir melewati jendela kesegaran tampilan. Nilainya tidak dijamin mencerminkan penggunaan saat ini. |
| Status server **Unavailable** | Panel tidak memperoleh status yang dapat digunakan. Jangan menafsirkannya sebagai shutdown yang sudah pasti.     |

Polling melambat atau mundur saat tab tersembunyi atau permintaan gagal. Nilai lama dapat tetap terlihat. Data lama, hilang, atau tidak diketahui berarti bukti tidak tersedia, bukan beban nol atau kegagalan layanan yang pasti.

Status **Running** menggambarkan VM, bukan keberhasilan SSH, RDP, situs, atau database. Informasi OS memiliki sumber dan umur pengamatan tersendiri; metadata templat bukan pengamatan tamu terbaru.

## Meninjau riwayat telemetri

1. Buka **Telemetry** dari navigasi server.
2. Pilih **Timeframe**: **Last 1 hour**, **Last 24 hours**, **Last 7 days**, **Last 30 days**, atau **Last 1 year**.
3. Pilih **Aggregation**: **Default**, **Average**, atau **Maximum**.
4. Tunggu riwayat yang dipilih termuat.
5. Gunakan **Show metrics:** untuk menampilkan grafik CPU, memori, jaringan, atau disk yang relevan.
6. Cocokkan waktu dengan kejadian dan catat peringatan atau celah data.

Pilihan rentang waktu meminta riwayat yang tersedia, bukan menjanjikan satu tahun data lengkap untuk setiap server. Tampilan dapat kosong pada server baru, offline, atau belum melaporkan metrik.

### Menafsirkan pengukuran

- CPU menunjukkan penggunaan sumber daya, bukan waktu respons aplikasi.
- Grafik memori menunjukkan penggunaan dan alokasi teramati; periksa rincian tamu sebelum menyimpulkan kebocoran memori.
- Grafik jaringan menunjukkan throughput masuk dan keluar dalam byte per detik, bukan jaminan tes kecepatan atau sisa kuota transfer.
- **Disk Throughput** menunjukkan byte baca/tulis per detik, bukan ruang disk kosong, kesehatan filesystem, atau ukuran backup.

**Average** merangkum satu periode sampel dan dapat menyamarkan lonjakan singkat. **Maximum** menunjukkan nilai maksimum dalam tiap periode, bukan seluruh kejadian sesaat. Bandingkan rentang dan agregasi yang sama.

Nilai metrik yang hilang bukan pengukuran nol yang sah. Sebagian sampel dapat tidak lengkap atau dikeluarkan. Peringatan grafik tidak lengkap membatasi kesimpulan untuk interval tersebut.

Metadata riwayat menggunakan UTC; waktu grafik diformat untuk tampilan. Catat zona waktu saat membagikan waktu kejadian. Jangan menganggapnya sebagai waktu lokal jadwal backup otomatis.

## Menggunakan aktivitas sebagai bukti pendukung

Buka **Activity** untuk meninjau tindakan panel yang tercatat. Gunakan pagination untuk melihat sekitar waktu kejadian jika izin Anda memungkinkan.

Entri aktivitas dapat menunjukkan permintaan telah dibuat. Entri itu belum tentu membuktikan instalasi, backup, restore, atau operasi daya asinkron selesai. Periksa status hasil atau catatan operasi secara terpisah.

Aktivitas panel tidak menggantikan log aplikasi, autentikasi, atau OS di sistem tamu. Tidak adanya aktivitas bukan bukti tidak ada perubahan di dalam tamu.

## Pemecahan masalah tanpa tebakan destruktif

| Gejala                                         | Langkah aman berikutnya                                                                                              |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Waiting** terus muncul                       | Pastikan halaman termuat dan jaringan Anda berfungsi. Muat ulang sekali dan catat kesalahan permintaan.              |
| **Stale** setelah kembali ke tab               | Biarkan tab terlihat dan tunggu polling berlanjut. Bandingkan waktu pembaruan, bukan hanya angkanya.                 |
| **No telemetry data**                          | Coba rentang relevan lain. Periksa umur/status server dan laporkan jika terus kosong. Grafik kosong bukan beban nol. |
| Celah atau peringatan data tidak lengkap       | Tentukan interval terdampak. Cocokkan log lain; jangan mengisi bukti yang hilang dengan asumsi kondisi sehat.        |
| CPU atau memori tinggi                         | Bandingkan proses tamu dan log aplikasi pada interval sama. Hindari penghentian paksa hanya berdasarkan satu grafik. |
| Throughput rendah tetapi aplikasi lambat       | Periksa latensi aplikasi, sumber daya tamu, dan jalur jaringan. Throughput saja tidak menentukan penyebab hambatan.  |
| Akses aktivitas ditolak                        | Minta `activity.read` kepada pemilik, bukan akun bersama.                                                            |
| Permintaan tercatat tetapi tugas masih pending | Periksa status dan bukti penyelesaian operasinya sendiri. Jangan berulang kali mengirim ulang.                       |

Laporkan metrik yang terus hilang, status node tidak tersedia, atau operasi macet ke [dukungan 8Labs](/id/docs/help/contact). Sertakan ID server, waktu kejadian UTC, rentang, agregasi, kesegaran/waktu pembaruan, dan pesan kesalahan.

Sensor nama pengguna, IP, identitas, dan rincian aktivitas sensitif yang tidak diperlukan. Jangan kirim kata sandi, kunci privat, atau token sesi. Jangan reinstall atau menghapus server untuk memperbaiki tampilan telemetri.

## Panduan terkait

- [Ringkasan server](/id/docs/servers/overview)
- [Tindakan daya](/id/docs/servers/power)
- [Backup dan bukti penyelesaian](/id/docs/servers/backups)
- [Pengaturan server](/id/docs/servers/settings)
- [Pemecahan masalah](/id/docs/troubleshooting/overview)
