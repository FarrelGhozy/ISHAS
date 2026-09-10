# Stage Stage 06 — Lifecycle Penanganan + Hapus Completed

**Status:** REVIEW
**Catatan review:** D-05, D-06, dan D-07 telah diputuskan pemilik pada 9 September 2026.
**Dependensi:** Stage 05 `DONE` (laporan `Pending` sudah ada).
**Tujuan:** mengelola status `Pending → Proses → Completed → Arsip` dengan syarat tiap transisi,
aturan mundur, audit abadi, dan pemetaan visual yang persis.

## Ruang lingkup

### 1. Transisi dan syarat (ditolak sistem bila syarat tak terpenuhi)

- [x] `Pending → Proses`: wajib PIC (teks, 2–100) + tenggat (tanggal, tidak boleh masa lalu) + catatan rencana.
- [x] `Proses → Completed`: wajib progres 100% + bukti penyelesaian (nama file dummy) + catatan penutup;
 rekomendasi terkait menjadi `Terverifikasi`.
- [x] Mundur (`Proses → Pending`, `Completed → Proses`): hanya dengan alasan wajib (min 10);
 tombol sekunder + peringatan; audit `Mengembalikan status`.
- [x] `Completed → Arsip`: hanya dari `Completed`; alasan arsip wajib; laporan, temuan, dan audit tetap tersimpan.
 Arsip tidak menjadi sumber dashboard publik, tetapi tetap dapat dilihat Pengelola Pesantren pada scope-nya.
- [x] Diagram satu-satunya yang sah: `Menunggu validasi → Ditolak` | `Menunggu validasi → Pending → Proses → Completed → Arsip` (FLOWS §5). Tidak ada lompatan (`Pending → Completed` DITOLAK sistem).

### 2. Visual status (persis DESIGN_SYSTEM §2 — spot-check wajib)

- [x] `Menunggu validasi` neutral/jam; `Pending` amber/jam; `Proses` blue/progres; `Completed` green/centang;
 `Ditolak` neutral/silang (hanya antrean); severity/priority Tinggi-red/Sedang-amber/Rendah-green.
- [x] Tidak ada teks status tanpa chip; tidak ada chip tanpa ikon.

### 3. Test store (wajib, bukan opsional)

- [x] Tiap transisi sah mengubah state + audit; tiap pelarangan mengembalikan error message persis
 (tanpa pesan → tanpa alasan; tanpa PIC/tenggat → tanpa proses; tanpa bukti → tanpa selesai;
 hapus non-Completed → ditolak; lompatan → ditolak).
- [x] Arsip `Completed` tidak menghapus laporan, temuan, maupun audit event terkait.

## Acceptance criteria

- [x] Test store Stage 06 hijau (3 skenario lifecycle termasuk isolasi scope dan arsip publik).
- [ ] Pemeriksaan visual 3 viewport dan build akhir.

## Hasil Pemeriksaan

- 9 September 2026: implementasi lifecycle, verifikasi temuan, pembaruan rekomendasi, pembukaan kembali,
 serta arsip scope Pengelola Pesantren selesai. `bun test` (50 pass), typecheck, dan lint lulus.
