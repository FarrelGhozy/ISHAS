# ISHAS

Integrated Safety and Health Assessment System adalah prototipe sistem penilaian K3L untuk pesantren. Tahap saat ini berfokus pada validasi tampilan dan fitur menggunakan data dummy. Backend dan formula ilmiah final belum diimplementasikan.

## Struktur repository

- `apps/web` — aplikasi ISHAS (React Router + TypeScript + bun).
- `docs/source` — proposal asli sebagai sumber penelitian.
- `docs` — sumber kebenaran: visi, peran, route, alur, model data, dan spesifikasi produk yang berlaku.
- `planning` — local issue management stage (Stage 00...09).
- `flow.md` — alur operasional aplikasi.
- `docs/TODO.md` — kontrol pekerjaan yang sedang aktif.
- `AGENTS.md` — aturan tetap untuk pekerjaan di repository.

## Menjalankan frontend

```bash
cd apps/web
bun install
bun run dev
```

Dev server berjalan di port `3003` dan dapat diakses dari jaringan (`host 0.0.0.0`). Pemeriksaan teknis dapat dijalankan dengan `bun run lint`, `bun run typecheck`, `bun test`, dan `bun run build`. Data dummy tersimpan di browser selama demo (kunci `ishas-mock-v4`) dan dapat dikembalikan ke seed awal melalui Pengaturan Admin (Reset data demo).

Alamat utama `/` membuka dashboard publik tanpa login: agregat semua pesantren terdaftar plus pemilih pesantren. Tidak ada landing page dan tidak ada redirect. Tombol **Masuk** mengarah ke `/login`. Laporan dapat dikirim publik tanpa login (`/lapor`) atau oleh Pengelola Pesantren; semua laporan wajib validasi pengelola sebelum tampil di dashboard.

## Akun demo frontend

Login demo memakai kartu akun, tanpa kata sandi. Tidak ada peran Asesor.

| Peran | Email | Fokus |
| --- | --- | --- |
| Super Admin | `admin@ishas.demo` | Pesantren, akun pengelola, audit |
| Peneliti | `peneliti@ishas.demo` | Instrumen, versi, dan konfigurasi penilaian |
| Pengelola Pesantren | `pengelola@ishas.demo` | Validasi laporan, lokasi, dan tindak lanjut |

## Status data

Semua angka, skor, kategori, indikator, dan isi assessment di frontend saat ini adalah data dummy. Data tersebut tidak boleh dianggap sebagai hasil penelitian atau formula ISHAS final.

## Aturan utama

1. Instrumen ilmiah tidak di-hard-code sebagai kebenaran final.
2. Versi instrumen Published tidak diubah langsung.
3. Assessment final selalu terkait dengan versi instrumen dan konfigurasi scoring.
4. Perubahan yang memengaruhi hasil historis harus memiliki versioning dan audit trail.
5. Identitas commit mengikuti konfigurasi Git milik pemilik repository. Jangan menambahkan atribusi AI atau `Co-authored-by`.

Lihat `CONTRIBUTING.md` untuk ketentuan kontribusi, `AGENTS.md` untuk aturan kerja, serta `docs/` untuk spesifikasi produk yang berlaku.
