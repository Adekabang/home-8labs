---
title: Personal API keys dan webhook
description: Buat token pribadi dengan cakupan tertentu, pahami masa berlaku, cabut kredensial, dan kelola langganan webhook pelanggan.
contentId: account-api-keys
owner: 8Labs support
reviewedVersion: LabsPanel 6.0.17
reviewedDate: 2026-11-19
translationStatus: translated
---

Personal API key mengautentikasi skrip dan alat **sebagai akun runtime Anda**. Izin sumber daya akun tetap berlaku pada setiap permintaan.

## Pengguna, ketersediaan, dan prasyarat

Panduan ini ditujukan untuk pemilik akun yang mengotomatisasi sumber daya sesuai izinnya di [cloud.8labs.id](https://cloud.8labs.id). Kontrol API key dan webhook bergantung pada konfigurasi layanan.

Gunakan akun sendiri, tentukan alat yang membutuhkan akses, dan siapkan penyimpanan rahasia yang aman. Halaman **Developers** menyediakan URL dasar dan referensi endpoint untuk layanan tersebut. Penyiapan token aplikasi operator tidak dibahas di sini.

**API Access** pada **Admin → Platform** adalah halaman operator, bukan halaman key pribadi pelanggan.
Status admin organisasi tidak memberikan akses ke halaman tersebut.
Untuk skrip pelanggan, tetap gunakan **Workspace → Developers**. Tanyakan endpoint yang tidak tersedia kepada dukungan, bukan meminta kredensial seluruh platform.

Pembuatan dan pencabutan key memerlukan [konfirmasi identitas sensitif](/id/docs/account/security#konfirmasikan-identitas-untuk-perubahan-sensitif). Saat TOTP aktif, gunakan hanya kode autentikator. Tanpa TOTP, akun terhubung memakai PIN Paymenter dari layanan yang cocok jika tersedia. Akun native tanpa hubungan Paymenter memakai kata sandi Panel saat ini. Jika pembuat PIN tidak tersedia, hubungi dukungan, bukan memakai kata sandi atau email untuk melewatinya.

Selesaikan persetujuan, lalu kembali ke **Create key** atau kontrol pencabutan dan kirim tindakan yang dituju secara eksplisit. Persetujuan tidak mengulang permintaan yang ditolak secara otomatis. Persetujuan kata sandi akun tidak mengizinkan pengelolaan key. Setiap persetujuan PIN mengizinkan satu perubahan terlindungi sesuai tujuannya.

Konfirmasi sensitif yang sama juga melindungi pembuatan, pembaruan seperti penjedaan atau rotasi rahasia, dan penghapusan webhook. Periksa dan kirim setiap perubahan yang dituju secara eksplisit setelah persetujuan. Identitas terkonfirmasi tidak membuktikan pengiriman webhook berhasil.

<span id="creating-a-key"></span>

## Buat personal API key

1. Buka **Workspace → Developers → API keys**.
2. Pilih **Create key**.
3. Isi **Name** dengan nama alat atau tujuannya, misalnya `ci-pipeline`.
4. Pilih **Scope**: **Read-only** atau **Full access**.
5. Pilih **Expiry** lalu kirim.
6. Tunggu pembuatan berhasil.
7. Salin token ke penyimpanan rahasia yang aman sebelum menutup hasilnya.

**Token hanya ditampilkan sekali.** Anda tidak dapat mengambilnya kembali. Jika hilang, cabut key tersebut dan buat pengganti. Jangan menempelkan token ke repositori publik, tangkapan layar, tiket, atau percakapan.

### Arti Never untuk key pribadi

Pilihan masa berlaku meliputi **Never**, **30 days**, **90 days**, dan **1 year**. **Never** berarti tidak ada tenggat tambahan per key. Pilihan ini tidak menjamin token pribadi berlaku selamanya.

Key pribadi (`ACCOUNT`) tetap mengikuti batas umur token tingkat panel melalui `SANCTUM_TOKEN_LIFETIME`. Nilai bawaan sumber adalah 30 hari; konfigurasi layanan dapat berbeda. Batas yang lebih dahulu tercapai tetap berlaku, sehingga pilihan yang lebih panjang tidak mengesampingkan batas panel.

Token aplikasi yang diterbitkan administrator memiliki perilaku masa berlaku tersendiri. Arti **Never** pada token tersebut tidak mengubah key pribadi. Tanyakan masa berlaku token pribadi pada dukungan jika integrasi membutuhkan jadwal rotasi.

<span id="scopes"></span>

## Pilih cakupan

| Scope           | Tindakan yang diizinkan                                                 |
| --------------- | ----------------------------------------------------------------------- |
| **Full access** | Permintaan yang diizinkan oleh akun dan izin sumber daya Anda.          |
| **Read-only**   | Permintaan aman `GET`, `HEAD`, dan `OPTIONS`; permintaan tulis ditolak. |

Cakupan dan izin sumber daya berlaku bersama. Key full-access tidak memberikan akses ke server yang tidak dapat digunakan akun Anda. Key read-only tidak dapat menulis hanya karena Anda memiliki server tersebut.

Utamakan **Read-only** jika alat hanya mengambil informasi. Tinjau [model akses tim](/id/docs/teams/overview) sebelum memberikan akses akun yang luas untuk otomatisasi.

<span id="using-a-key"></span>

## Gunakan key dengan aman

Buka **Developers** pada sidebar untuk URL dasar terkini, referensi endpoint, dan contoh curl atau Terraform yang dapat disalin. Kirim token pada header `Authorization: Bearer`, bukan pada URL.

Contoh berikut digunakan setelah variabel lingkungan token disiapkan dengan aman:

```bash
curl 'https://cloud.8labs.id/api/application/client/servers' \
  -H "Authorization: Bearer ${LABSPANEL_API_KEY}" \
  -H 'Accept: application/json'
```

Jauhkan token dari riwayat shell dan log. Pastikan endpoint tersedia melalui halaman **Developers** layanan sebelum membuat integrasi. Respons API yang menerima operasi server belum tentu berarti pekerjaan asinkronnya selesai; periksa status server terkait.

<span id="revoking"></span>

## Cabut atau ganti key

1. Buka **Workspace → Developers → API keys**.
2. Temukan key berdasarkan nama dan informasi pemakaiannya.
3. Pilih tindakan pencabutan lalu konfirmasikan.
4. Tunggu daftar key diperbarui.

Pencabutan segera menghentikan autentikasi dengan key tersebut. Key lain tetap berlaku sesuai batasnya masing-masing. Perbarui alat terkait saat merotasi key; menghapus satu key tidak merotasi key lainnya.

Jika token mungkin bocor, cabut terlebih dahulu. Jangan menunggu kedaluwarsa. Tinjau akses terkait dan hubungi [dukungan](/id/docs/help/contact) jika mencurigai tindakan tanpa izin.

<span id="webhooks"></span>

## Kelola endpoint webhook pelanggan

Jika tersedia, halaman **Developers** memungkinkan akun mendaftarkan tujuan webhook sebagai pengganti pemeriksaan perubahan secara berkala.

1. Siapkan penerima HTTPS yang dapat diakses publik dan memverifikasi tanda tangan webhook.
2. Buka **Developers** lalu tambahkan URL HTTPS penerima.
3. Pilih filter peristiwa, misalnya `server:*`, jika diperlukan.
4. Kosongkan daftar peristiwa hanya jika Anda memang ingin menerima semua peristiwa yang tersedia.
5. Simpan dan amankan rahasia penandatanganan saat ditampilkan.

Sumber mendukung hingga lima endpoint per akun. Tujuan privat, loopback, dan alamat yang tidak dapat diresolusikan ditolak; jangan mencoba melewati perlindungan ini.

Pengiriman ditandatangani dengan HMAC. Rahasia penandatanganan tampil sekali saat pembuatan dan sekali saat diganti melalui **Rotate secret**; rahasia tidak dapat diambil kembali. Gunakan referensi terkini untuk menerapkan verifikasi sebelum mempercayai payload.

Gunakan **Pause** untuk menghentikan pengiriman tanpa menghapus konfigurasi endpoint. Gunakan **Rotate secret** jika rahasia mungkin bocor, lalu perbarui penerima dengan aman. Endpoint tersimpan belum membuktikan bahwa penerima sudah menerima pengiriman.

## Pemecahan masalah dan eskalasi

- **Autentikasi gagal:** periksa apakah key dicabut, mencapai tenggat per key, atau mencapai batas umur tingkat panel.
- **Baca berhasil tetapi tulis gagal:** periksa cakupan **Read-only** dan izin sumber daya akun.
- **Sumber daya tidak muncul atau dilarang:** periksa kepemilikan dan akses delegasi; key baru tidak memperluas izin.
- **Rahasia tidak tersimpan:** cabut dan ganti API key, atau rotasi rahasia webhook.
- **URL webhook ditolak:** gunakan tujuan HTTPS publik yang dapat diresolusikan, bukan layanan internal.

Jika belum selesai, hubungi [dukungan 8Labs](/id/docs/help/contact) dengan nama key atau identitas endpoint, waktu kejadian, dan pesan kesalahan tersamarkan. Jangan sertakan bearer token atau rahasia penandatanganan.

<span id="see-also"></span>

## Panduan terkait

- [Keamanan akun](/id/docs/account/security)
- [Ringkasan tim dan akses](/id/docs/teams/overview)
- [Izin proyek](/id/docs/teams/projects#permission-set)
- [Langganan notifikasi](/id/docs/account/notifications)
