# Stage V2-03 — Laporan Cepat `/lapor`

**Status:** BACKLOG
**Catatan review:** belum diizinkan membuat kode. Bagian terkait D-02, D-03, D-10 dan D-11
masih menunggu keputusan di `../DECISIONS.md`. Checklist di bawah adalah rancangan awal;
ruang lingkupnya harus diselaraskan setelah jawaban pemilik diterima.
**Dependensi:** V2-01 `DONE` (model + seed + area), V2-02 disarankan (CTA sudah ada).
**Tujuan:** form laporan satu langkah yang bisa dikirim anonim maupun login,
dengan validasi ketat dan layar sukses bernomor — tanpa pernah tampil langsung di dashboard.

## Ruang lingkup

### 1. Form (satu langkah, tanpa wizard; urutan field tetap)

- [ ] Nama pelapor* (2–100 karakter) + checkbox anonim + penjelasan penyimpanan nama.
  Bila login pengelola: terisi otomatis `nama akun` + label peran; tetap editable.
- [ ] Pesantren* (dropdown HANYA terdaftar, `kode — nama`; tidak ada isi manual).
- [ ] Lokasi/area* (dropdown area milik pesantren terpilih; kosong → pesan hubungi pengelola, submit dikunci).
- [ ] Judul temuan* (10–140) + Deskripsi* (min 20 + hint 4 pertanyaan panduan) +
  Foto (opsional, nama file dummy) + Kontak (opsional, maks 100).
- [ ] Error inline per field dengan kalimat persis `WIREFRAMES.md` §2; tombol **Kirim laporan**
  (`primary-button`) disabled sampai semua wajib valid; **Batal** dengan konfirmasi bila sudah mengetik.
- [ ] `/lapor` dapat dibuka sebagai halaman dan sebagai dialog dari `/`, tetapi URL kanonis tetap `/lapor`
  (mendukung `?pesantren=PSN-XXXX`; param tak valid menampilkan pesan dan memerlukan pilihan terdaftar yang eksplisit, bukan penggantian tujuan diam-diam).

### 2. Pengiriman dan jejak

- [ ] Sukses → `submitPublicReport`: `RPT-XXXX` berurutan, `Menunggu validasi` ganda
  (validation + handling), severity/priority `Belum ditentukan` + audit `Mengirim laporan publik` +
  notifikasi ke pengelola pemilik scope (`/pengelola/validasi-laporan`).
- [ ] Layar sukses persis `WIREFRAMES.md` §2 (nomor + chip + penjelasan belum tampil + tombol kembali).
- [ ] Laporan TIDAK masuk selector validated (dashboard/hasil/peta tetap steril) — dibuktikan test.
- [ ] Draft form (input belum dikirim) bertahan saat refresh (localStorage per pesantren).

### 3. Penolakan sistem (pesan eksplisit, bukan diam)

- [ ] Nol pesantren terdaftar → tombol lapor nonaktif + penjelasan (bukan dropdown kosong).
- [ ] Pesantren nonaktif/tak dikenal via URL → `Pesantren tidak tersedia untuk pelaporan.`
- [ ] Duplikat kirim ganda (double-click) → satu record (tombol dikunci saat mengirim + idempotency sederhana).

## Di luar ruang lingkup

- Antrean validasi dan lifecycle (V2-05/06), penilaian mandiri (V2-08).

## Acceptance criteria

- [ ] Skenario TEST_PLAN §3 nomor 1, 2, 7 lulus pada sisi pengiriman/data; pemeriksaan UI antrean pengelola dilengkapi bersama V2-05 dan dicatat belum diuji sampai tersedia.
- [ ] Copy + status + warna persis WIREFRAMES §2 dan DESIGN_SYSTEM §2.
- [ ] Visual 1440/834/390 + keyboard penuh sampai tombol kirim; TEST_PLAN §1 baris 3.
- [ ] Lint, typecheck, test, build lulus.

## Hasil Pemeriksaan

- (Template `TEST_PLAN.md` §6.)
