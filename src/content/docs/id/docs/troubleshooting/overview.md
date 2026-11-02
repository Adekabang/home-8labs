---
title: "Pecahkan masalah berdasarkan gejala"
description: "Temukan batas kegagalan sebelum mengubah server atau mengulangi pembayaran."
contentId: "customer-troubleshooting-overview"
owner: "8Labs support"
reviewedVersion: "LabsPanel 5.3.15"
reviewedDate: "2026-11-02"
translationStatus: "translated"
---

Mulai dari gejala yang terlihat. Simpan status dan pesan kesalahan sebelum melakukan tindakan lain.

## Masalah koneksi

| Gejala                        | Tempat pemeriksaan                                            | Langkah berikutnya                                                                              |
| ----------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| SSH timeout                   | Komputer Anda: alamat dan keluarga IP; Panel: status berjalan | Ikuti [diagnosis SSH](/id/docs/getting-started/ssh/#jika-koneksi-gagal).                        |
| SSH ditolak                   | Konsol tamu: layanan SSH dan port                             | Periksa layanan sesuai OS; jangan membuka semua port firewall.                                  |
| Permission denied (publickey) | Komputer Anda: kunci terpilih; tamu: akun yang diizinkan      | Cocokkan kunci dan akun sebelum membuat atau mengganti kunci.                                   |
| RDP tidak tersedia            | Konsol tamu: status Windows dan alamat resmi                  | Ikuti [diagnosis RDP](/id/docs/getting-started/rdp/).                                           |
| Konsol tidak tersedia         | Izin Panel dan status koneksi konsol                          | Ikuti [bantuan konsol](/id/docs/servers/console/).                                              |
| IP belum ditetapkan           | Informasi jaringan server                                     | Minta dukungan; jangan memilih alamat sembarang dari subnet gateway.                            |
| Koneksi NAT gagal             | Alamat dan port eksternal                                     | Metadata NAT tidak otomatis membuat aturan gateway. Baca [jaringan](/id/docs/servers/network/). |

Jangan mematikan pemeriksaan kunci host, mengaktifkan masuk root dengan kata sandi, atau menonaktifkan seluruh firewall sebagai perbaikan umum.

## Daya, kinerja, dan pengamatan yang hilang

| Gejala                                           | Tindakan aman                                                                                                 |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Node tidak terhubung atau status tidak diketahui | Catat waktu dan hubungi dukungan; jangan mengulang permintaan daya.                                           |
| Server terus sibuk                               | Periksa **Activity** dan tunggu pekerjaan saat ini; laporkan kegagalan yang berlanjut.                        |
| Metrik tidak tersedia                            | Periksa kesegaran data dan rentang waktu. Data hilang bukan penggunaan nol.                                   |
| Aplikasi lambat                                  | Bandingkan pengamatan sumber daya dengan bukti di dalam tamu; peningkatan paket belum tentu menyelesaikannya. |
| Instalasi gagal                                  | Catat tahap serta kesalahan; minta dukungan sebelum mengulang atau memesan lagi.                              |

Baca [Telemetry](/id/docs/servers/telemetry/) dan [Daya](/id/docs/servers/power/).
Perintah diagnosis tamu dijalankan di dalam tamu, bukan pada host penyedia.
Gunakan alat yang sudah didukung sistem operasi. Jangan memasang pengumpul data berhak tinggi hanya untuk laporan sederhana.

## Pemulihan dan akses

| Gejala                                      | Tindakan aman                                                                                                      |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Cadangan tertunda                           | Periksa status sibuk dan kuota; jangan mengirim permintaan kedua yang bertumpuk.                                   |
| Cadangan gagal atau tidak lengkap           | Simpan pesan kesalahan; jangan pulihkan arsip yang belum diverifikasi. Baca [cadangan](/id/docs/servers/backups/). |
| Snapshot tidak tersedia                     | Pastikan hak fitur dan dukungan penyimpanan; snapshot bukan cadangan eksternal.                                    |
| Undangan kedaluwarsa                        | Minta undangan baru kepada pengundang yang berwenang. Jangan bagikan tautan lama.                                  |
| Token API kedaluwarsa atau ditolak          | Periksa masa berlaku, cakupan, dan akses akun; lakukan rotasi secara privat.                                       |
| Server atau tombol tidak muncul             | Periksa ruang kerja, izin efektif, dan ketersediaan fitur layanan.                                                 |
| Pesanan sudah dibayar tetapi masih tertunda | Periksa faktur dan hubungi dukungan dengan referensi privat; jangan membayar dua kali.                             |

## Tutorial perangkat lunak tamu

Untuk konfigurasi IPv6 Docker, baca [tutorial Docker](/docs/getting-started/install-docker-ipv6/) yang sudah ada dalam bahasa Inggris.
Tutorial menjelaskan perangkat lunak tamu, bukan jaminan image, rute, atau hak layanan Anda.

Jika batas kegagalan berada pada host, penetapan jaringan, broker konsol, integrasi pembayaran, atau hak fitur, [hubungi dukungan](/id/docs/help/contact/).
Kirim kesalahan yang disamarkan dan zona waktu, bukan kredensial atau rekaman peramban lengkap.
