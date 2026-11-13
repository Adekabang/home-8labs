---
title: "Nyalakan dan matikan server dengan aman"
description: "Bedakan penghentian normal dari pemaksaan dan tunggu status yang terkonfirmasi."
contentId: "customer-servers-power"
owner: "8Labs support"
reviewedVersion: "LabsPanel 6.0.7"
reviewedDate: "2026-11-13"
translationStatus: "translated"
---

**Pembaca:** pengguna server dengan `control.power`. Kontrol juga mengikuti status server dan operasi yang sedang berlangsung.

:::danger[Kontrol paksa dapat menghilangkan data]
**Kill** mematikan mesin tanpa penghentian normal sistem operasi.
Reset paksa, jika tersedia, memulai ulang mesin secara mendadak.
Penulisan yang belum selesai dan data aplikasi dapat hilang atau rusak. Utamakan tindakan normal.
:::

## Pilih tindakan

| Tindakan     | Makna                                  | Sebelum digunakan                              |
| ------------ | -------------------------------------- | ---------------------------------------------- |
| **Start**    | Meminta mesin yang mati untuk menyala. | Periksa instalasi dan ketersediaan host.       |
| **Shutdown** | Meminta tamu berhenti secara normal.   | Simpan pekerjaan dan tunggu aplikasi selesai.  |
| **Restart**  | Meminta tamu memulai ulang.            | Beri tahu pengguna aktif dan simpan pekerjaan. |
| **Kill**     | Mematikan mesin secara paksa.          | Nilai risiko kehilangan data terlebih dahulu.  |

Tombol yang tidak tersedia dapat menandakan izin kurang, status tidak diketahui, atau operasi yang sedang berjalan.
Tindakan normal memerlukan dukungan tamu. Respons yang lambat bukan alasan untuk langsung mematikan paksa.

Banner diagnosis **Node action restrictions** hanya untuk administrator root. Rinciannya tertutup sampai dibuka.
Tidak menampilkan banner ini kepada pelanggan tidak mengubah pemeriksaan kapabilitas atau pembatasan tindakan.
Pemeriksaan izin, status, dan ketersediaan pada setiap tindakan tetap menentukan apakah tindakan tersebut dapat digunakan.

## Minta tindakan dan periksa hasilnya

1. Buka **Servers**, lalu pilih server.
2. Pastikan identitas dan statusnya pada **Overview**.
3. Simpan pekerjaan tamu dan beri tahu pengguna terdampak.
4. Pilih tindakan daya yang dituju.
5. Baca konfirmasi jika ditampilkan.
6. Masukkan identitas server yang diminta untuk tindakan paksa.
7. Tunggu hasil tindakan dan pembaruan status.
8. Periksa keadaan tamu atau aplikasi secara terpisah.

Permintaan diterima belum berarti perubahan status selesai.
Jangan menekan berulang kali saat operasi masih sibuk.
Mesin dapat berjalan meskipun aplikasinya tidak tersedia.

Jika tidak ada operasi daya yang tercatat, Panel tidak menampilkan pesan riwayat kosong.
Status tertunda, gagal, tidak diketahui, dan kesalahan pembacaan status tetap muncul jika berlaku.
Tidak adanya pesan bukan bukti bahwa tindakan berhasil.
Status **succeeded** hanya mengonfirmasi tugas yang cocok dan pembacaan ulang status server, bukan boot OS tamu atau kesehatan aplikasi.

## Jika status tidak berubah

Periksa kegagalan pada **Activity** dan kesegaran data pada [Telemetry](/id/docs/servers/telemetry/).
Jika status tidak diketahui atau node tidak tersedia, hubungi dukungan dengan jenis tindakan dan waktunya.
Jangan mengulangi kontrol paksa untuk mengatasi host yang tidak terhubung.
Mematikan server belum tentu menghentikan [tagihan penyedia](/id/docs/billing-plans/overview/).

[Bantuan konsol](/id/docs/servers/console/) · [Titik pemulihan](/id/docs/servers/backups/)
