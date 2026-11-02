---
title: "Gunakan konsol peramban"
description: "Buka konsol grafis atau serial dan pulihkan peluncuran yang kedaluwarsa."
contentId: "customer-servers-console"
owner: "8Labs support"
reviewedVersion: "LabsPanel 5.3.15"
reviewedDate: "2026-11-02"
translationStatus: "translated"
---

**Pembaca:** pengguna server dengan `control.console` atau izin efektif yang mencakup akses konsol.
**Ketersediaan:** operator harus menyiapkan broker konsol dan server harus mendukung jenis konsol yang dipilih.

## Sebelum membuka konsol

Konsol peramban menghubungkan mesin virtual melalui host-nya. Konsol bukan SSH dan tidak memerlukan jaringan SSH tamu.
Host, layanan konsol, dan sesi Panel tetap harus berfungsi.
Gunakan akun sistem operasi tamu untuk masuk, bukan kata sandi Cloud Panel.
Image Linux yang disiapkan dengan kunci saja mungkin tidak memiliki kata sandi.
Jangan mengaktifkan masuk root dengan kata sandi hanya untuk memperoleh prompt konsol.

## Buka sesi

1. Buka [Cloud Panel](https://cloud.8labs.id).
2. Buka **Servers**, lalu pilih server yang benar.
3. Buka **Console**.
4. Pilih **VNC** grafis atau **Serial** jika pilihan tersebut tersedia.
5. Jika jendela diblokir, izinkan jendela konsol hanya untuk situs Panel tepercaya.
6. Tunggu status koneksi sebelum memasukkan input tamu.
7. Masuk ke tamu jika prompt autentikasi muncul.

Panel memberikan kredensial peluncuran berumur pendek kepada layanan konsol yang dikonfigurasi.
Peluncur menghapus kredensial dari alamat sebelum menyiapkan sesi. Jangan menyalin atau membagikan URL peluncuran.
Sesi yang sudah terhubung dapat berlanjut setelah masa peluncuran berakhir.
Koneksi baru setelah kedaluwarsa memerlukan peluncuran baru dari Panel.
Simpan halaman server sebagai bookmark, bukan alamat peluncuran konsol.

![Halaman Console dengan kartu VNC Console dan Terminal Console serta tombol peluncuran.](../../../../../assets/docs/console-chooser.webp)

_UI produksi yang disanitasi — pengamatan hanya-baca — LabsPanel v5.3.15. Hanya pemilih Console: VNC Console dan Terminal Console. Kedua tombol peluncuran tidak ditekan dan tidak ada sesi guest yang dibuka. Label UI tetap berbahasa Inggris; hanya keterangan gambar yang diterjemahkan._

## Pilih jenis konsol

**VNC** menampilkan layar grafis tamu. Isinya dapat berupa firmware, desktop grafis, atau layar masuk teks.
**Serial** menampilkan terminal serial yang dikonfigurasi pada tamu.
Layar serial kosong dapat berarti tamu tidak menyediakan prompt serial.
Kedua pilihan tidak menjamin tamu berjalan atau kredensialnya telah disiapkan.
Periksa status koneksi untuk membedakan koneksi terputus dari layar tamu yang kosong.

## Keyboard, clipboard, dan tampilan

Klik area tampilan sebelum mengetik. Pintasan dapat ditangkap peramban atau sistem operasi sebelum mencapai tamu.
Gunakan bantuan keyboard yang benar-benar tersedia pada konsol. Jangan menganggap semua pintasan lokal diteruskan.
Akses clipboard bergantung pada izin peramban dan dukungan konsol.
Tempel hanya isi yang memang hendak Anda jalankan pada tamu.
Periksa tujuan fokus sebelum menempelkan kata sandi atau perintah.
Gunakan kontrol skala atau penyesuaian VNC jika tersedia. Kontrol itu tidak mengubah resolusi tamu atau sumber daya server.

## Sesi kedaluwarsa atau terputus

| Status                                | Tindakan berikutnya                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Peluncuran tidak ada atau tidak valid | Tutup konsol dan buka kembali dari halaman server yang diizinkan.                                     |
| Peluncuran kedaluwarsa                | Kembali ke Panel dan minta sesi konsol baru.                                                          |
| Koneksi terputus                      | Gunakan sambung kembali jika tersedia dan sesi masih valid. Jika tidak, luncurkan kembali dari Panel. |
| Tampilan serial kosong                | Pastikan image mendukung serial. Gunakan VNC jika didukung.                                           |
| Akses Panel ditolak                   | Minta pemilik memeriksa izin konsol efektif Anda.                                                     |
| Host atau broker tidak tersedia       | Hubungi dukungan; perubahan SSH tamu tidak memperbaiki broker.                                        |

Sebagian penerapan dapat memakai jalur broker Panel langsung.
Ikuti kontrol yang ditampilkan; jangan mengubah URL konsol sendiri.
Menutup konsol memutus tampilan peramban itu, bukan mematikan server atau mengakhiri semua sesi tamu.

## Laporkan masalah dengan aman

Kirim waktu, versi peramban, jenis konsol, status koneksi, dan pesan kesalahan yang disamarkan kepada [dukungan](/id/docs/help/contact/).
Jangan kirim URL peluncuran, cookie, ekspor penyimpanan peramban, tiket konsol, JWT, atau rekaman jaringan mentah.
Hilangkan isi terminal dan identitas sebelum membagikan tangkapan layar.

[Koneksi SSH](/id/docs/getting-started/ssh/) · [Kontrol daya](/id/docs/servers/power/) · [Pemulihan](/id/docs/troubleshooting/overview/)
