# Editorial language reference

Internal author guidance, not a customer task page. Keep technical definitions
in the relevant customer workflow, especially backup versus snapshot safety.

Current source review: LabsPanel 6.0.17, 2026-11-19. Owner: 8Labs support. Scope: paired account security/API-key, server settings/power, billing overview, and Windows RDP pages only. Other page review metadata remains historical.

Use the exact interface label when following a procedure. Indonesian explanations do not rename controls in the running Panel.

## Approved task terms

| English term              | Istilah Indonesia             | Meaning / Makna                                                                                                                                    | Exact UI label            | Avoid / Hindari                                                                         |
| ------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | --------------------------------------------------------------------------------------- |
| Sign in                   | Masuk                         | Authenticate to an account / Autentikasi ke akun                                                                                                   | Sign in                   | login account as a noun / akun login                                                    |
| Account                   | Akun                          | A user identity / Identitas pengguna                                                                                                               | Account                   | profile when account is meant / profil untuk akun                                       |
| Workspace                 | Ruang kerja                   | Personal or organization resource context / Konteks sumber daya pribadi atau organisasi                                                            | Workspace, Personal       | admin mode as ownership / mode admin sebagai kepemilikan                                |
| Organization              | Organisasi                    | Tenant team with roles / Tim pelanggan dengan peran                                                                                                | Organizations             | platform admin for organization admin / admin platform untuk admin organisasi           |
| Project                   | Proyek                        | Organization-linked server folder / Folder server yang ditautkan ke organisasi                                                                     | Share                     | project as separate VM / proyek sebagai VM terpisah                                     |
| Subuser                   | Pengguna delegasi server      | Scoped single-server access / Akses terbatas ke satu server                                                                                        | Settings → Access         | shared account / akun bersama                                                           |
| Backup                    | Cadangan                      | Recoverable archive subject to verification and retention / Arsip pemulihan yang mengikuti verifikasi dan retensi                                  | Backups & snapshots       | snapshot as external backup / snapshot sebagai cadangan eksternal                       |
| Restore                   | Pemulihan                     | Replace current state from a recovery point / Mengganti keadaan saat ini dari titik pemulihan                                                      | Restore                   | undo without data impact / pembatalan tanpa dampak data                                 |
| Snapshot                  | Snapshot                      | Storage-dependent point-in-time state / Keadaan sesaat yang bergantung pada penyimpanan                                                            | Snapshots                 | guaranteed independent backup / cadangan independen terjamin                            |
| Console                   | Konsol                        | Guest display or serial access through host / Akses layar atau serial tamu melalui host                                                            | Console                   | SSH when transport is console / SSH untuk koneksi konsol                                |
| Shutdown                  | Penghentian normal            | Ask guest to stop gracefully / Meminta tamu berhenti normal                                                                                        | Shutdown                  | Kill                                                                                    |
| Force stop                | Penghentian paksa             | Abrupt stop with data-loss risk / Pemadaman mendadak dengan risiko kehilangan data                                                                 | Kill                      | graceful shutdown / penghentian normal                                                  |
| Reinstall                 | Instal ulang                  | Replace guest OS with destructive impact / Mengganti OS tamu dengan dampak penghapusan                                                             | Reinstall                 | repair without data loss / perbaikan tanpa kehilangan data                              |
| Token                     | Token                         | Secret API or launch credential / Kredensial rahasia API atau peluncuran                                                                           | Developers                | public identifier / identitas publik                                                    |
| Stale                     | Kedaluwarsa                   | Observation is no longer fresh / Pengamatan tidak lagi mutakhir                                                                                    | Telemetry                 | zero or offline / nol atau mati                                                         |
| NAT mapping               | Pemetaan NAT                  | Published endpoint metadata; not gateway provisioning / Metadata alamat tujuan, bukan pembuatan aturan gateway                                     | Network                   | automatic port forwarding / penerusan port otomatis                                     |
| API Access                | Akses API operator            | Platform application/integration credentials, not customer personal keys / Kredensial aplikasi dan integrasi platform, bukan key pribadi pelanggan | API Access                | personal key page / halaman key pribadi                                                 |
| Developers                | Otomatisasi pelanggan         | Personal account keys and customer webhook controls / Key akun pribadi dan kontrol webhook pelanggan                                               | Developers                | API Access as a customer navigation label / API Access sebagai label navigasi pelanggan |
| Operation outcome unknown | Hasil operasi belum diketahui | Existing operation retains ownership until operator reconciliation / Operasi tetap menguasai server sampai operator menyelaraskannya               | Operation outcome unknown | failed means safe retry / gagal berarti aman diulang                                    |

## Writing policy

English procedures use active verbs, one action per sentence, and a target of 20 words per procedural sentence.
Descriptions target 25 words per sentence. Safety meaning takes priority over a word count.
This is ASD-STE100 Issue 9-informed technical English, not a claim of certification or full dictionary compliance.
Indonesian uses natural direct instructions and **Anda** consistently. English word limits are review prompts, not an Indonesian standard.

Commands, permission identifiers, and visible UI labels remain unchanged.

Review coverage and operational evidence are separate. Preserve each page's historical `reviewedVersion` unless the relevant current source was reviewed.
The 2026-11-16 customer audit covers all 27 paired task pages and five English guest tutorials, not a blanket current-release qualification.
The 2026-11-19 source review covers identity selection, account-password and API-key approval, TOTP management, VM authentication, resource lifecycle, and Windows completion on those six page pairs. It is not a whole-codebase or production-flow qualification.
Confirmed TOTP uses authenticator proof only. Linked accounts without TOTP require the matching-service PIN flow where rolled out. Do not imply that Panel v6.0.17 makes the Paymenter PIN generator universally available. Paymenter final v1.5.9+8Lv13 is not deployed. The active v12 bridge remains after the failed final drain and recovery.
Separate approval from an explicit subsequent save, and operation acceptance from confirmed completion. Confirmed identity proof lasts at most five minutes. PIN-backed proof also ends at the original ten-minute request deadline or one successful protected write, whichever occurs first. Regeneration does not extend the original deadline. Preserve unknown-operation stop conditions.
The Windows access pair now records v6.0.17 source review while retaining explicitly historical v6.0.14 production evidence. Hosted email recovery was observed unavailable. Do not present email or a native password as a linked-account PIN bypass.
Preserve historical v5.3.15 screenshot provenance and the migration registry's original source revision. The new authenticator-dialog image comes from an isolated rehearsal, not current production acceptance. Dates and capture provenance belong in the manifest.
The customer browser dialog selects PIN for a linked account without TOTP. The source API still accepts a known native password for the `sensitive` purpose, but not for `account_password`. Do not advertise this API distinction as a customer bypass when the hosted PIN generator is unavailable.
Use **Backups & Snapshots → Backups** or **Backups & Snapshots → Snapshots** for local recovery navigation.
Account **Backups**, **SSH Keys**, and **Firewall Templates** are separate workspace tasks.

## Pedoman penulisan Bahasa Indonesia

Gunakan label antarmuka yang persis sama saat mengikuti prosedur.
Penjelasan Bahasa Indonesia tidak mengganti nama kontrol pada Panel yang sedang digunakan.
Prosedur bahasa Inggris memakai kata kerja aktif, satu tindakan per kalimat, dan sasaran 20 kata untuk kalimat prosedur.
Deskripsi menargetkan 25 kata per kalimat. Makna keselamatan lebih penting daripada jumlah kata.
Pedoman ini mengikuti prinsip ASD-STE100 Issue 9, bukan klaim sertifikasi atau kepatuhan kamus lengkap.
Bahasa Indonesia memakai perintah langsung yang alami dan kata **Anda** secara konsisten.
Batas kata bahasa Inggris menjadi bahan peninjauan, bukan standar STE Bahasa Indonesia.
Perintah, identitas izin, dan label antarmuka tetap dipertahankan.
