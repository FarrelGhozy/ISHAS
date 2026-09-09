# Stage V2-06 — Lifecycle Penanganan + Hapus Completed

**Status:** BACKLOG
**Catatan review:** belum diizinkan membuat kode. Bagian terkait D-05, D-06 dan D-07
masih menunggu keputusan di `../DECISIONS.md`. Checklist di bawah adalah rancangan awal;
ruang lingkupnya harus diselaraskan setelah jawaban pemilik diterima.
**Dependensi:** V2-05 `DONE` (laporan `Pending` sudah ada).
**Tujuan:** mengelola status `Pending → Proses → Completed → Dihapus` dengan syarat tiap transisi,
aturan mundur, audit abadi, dan pemetaan visual yang persis.

## Ruang lingkup

### 1. Transisi dan syarat (ditolak sistem bila syarat tak terpenuhi)

- [ ] `Pending → Proses`: wajib PIC (teks, 2–100) + tenggat (tanggal, tidak boleh masa lalu) + catatan rencana.
- [ ] `Proses → Completed`: wajib progres 100% + bukti penyelesaian (nama file dummy) + catatan penutup;
  rekomendasi terkait menjadi `Terverifikasi`.
- [ ] Mundur (`Proses → Pending`, `Completed → Proses`): hanya dengan alasan wajib (min 10);
  tombol sekunder + peringatan; audit `Mengembalikan status`.
- [ ] `Completed → Dihapus`: hanya dari `Completed`; dialog konfirmasi + alasan hapus (wajib);
  menghapus report + temuan turunannya; AUDIT penghapusan tetap ada (`Menghapus laporan selesai`).
- [ ] Diagram satu-satunya yang sah: `Menunggu validasi → Ditolak` | `Menunggu validasi → Pending → Proses → Completed → Dihapus` (FLOWS §5). Tidak ada lompatan (`Pending → Completed` DITOLAK sistem).

### 2. Visual status (persis DESIGN_SYSTEM §2 — spot-check wajib)

- [ ] `Menunggu validasi` neutral/jam; `Pending` amber/jam; `Proses` blue/progres; `Completed` green/centang;
  `Ditolak` neutral/silang (hanya antrean); severity/priority Tinggi-red/Sedang-amber/Rendah-green.
- [ ] Tidak ada teks status tanpa chip; tidak ada chip tanpa ikon.

### 3. Test store (wajib, bukan opsional)

- [ ] Tiap transisi sah mengubah state + audit; tiap pelarangan mengembalikan error message persis
  (tanpa pesan → tanpa alasan; tanpa PIC/tenggat → tanpa proses; tanpa bukti → tanpa selesai;
  hapus non-Completed → ditolak; lompatan → ditolak).
- [ ] Hapus `Completed` tidak menghapus audit event terkait.

## Acceptance criteria

- [ ] Skenario TEST_PLAN §3 nomor 5 lulus penuh (termasuk semua penolakan).
- [ ] Test store V2-06 hijau; visual 3 viewport; lint, typecheck, build lulus.

## Hasil Pemeriksaan

- (Template `TEST_PLAN.md` §6.)
