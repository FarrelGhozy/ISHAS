# ISHAS

Integrated Safety and Health Assessment System adalah prototipe sistem penilaian K3L untuk pesantren. Tahap saat ini berfokus pada validasi tampilan dan fitur menggunakan data dummy. Backend dan formula ilmiah final belum diimplementasikan.

> Catatan branch `v2`: core aktif adalah aplikasi ISHAS baru (React Router + bun) di `apps/web/` dengan sumber kebenaran `docs/v2/`. Core lama (Next.js/vinext, empat peran + Asesor) diarsipkan di `apps/_archived/web-v1/` dan tidak dipakai di branch ini. Branch `main`/`v1` menyimpan core lama apa adanya.

## Struktur repository

- `apps/web` — core aktif branch `v2`: aplikasi ISHAS (React Router + TypeScript + bun).
- `apps/_archived/web-v1` — arsip core lama (Next.js/vinext), hanya di branch `v2`; tidak dipakai dan tidak di-build.
- `docs/source` — proposal asli sebagai sumber penelitian.
- `docs/blueprint` — blueprint dan spesifikasi lama (konteks V1).
- `docs/v2` — sumber kebenaran branch `v2`: visi, peran, route, alur, model data, dan stage V2-00…V2-09 di `docs/v2/planning/`.
- `docs/FRONTEND_RULES.md`, `docs/BACKEND_INTEGRATION.md`, `docs/DEMO_SCENARIOS.md`, `docs/FEATURE_COVERAGE.md` — catatan lintas versi (konteks V1 kecuali dinyatakan lain).
- `planning` — local issue management stage V1 (Stage 01…12).
- `flow.md` — flow penggunaan utama versi lama (konteks V1).
- `TODO.md` — kontrol pekerjaan yang sedang aktif.
- `AGENTS.md` — aturan tetap untuk pekerjaan di repository.

## Menjalankan frontend (core V2)

```bash
cd apps/web
bun install
bun run dev
```

Dev server berjalan di port `3003` dan dapat diakses dari jaringan (`host 0.0.0.0`). Pemeriksaan teknis dapat dijalankan dengan `bun run lint`, `bun run typecheck`, `bun test`, dan `bun run build`. Data dummy tersimpan di browser selama demo (kunci `ishas-mock-v4`) dan dapat dikembalikan ke seed awal melalui Pengaturan Admin (Reset data demo).

Alamat utama `/` membuka dashboard publik tanpa login: agregat semua pesantren terdaftar plus pemilih pesantren. Tidak ada landing page dan tidak ada redirect. Tombol **Masuk** mengarah ke `/login`. Laporan dapat dikirim publik tanpa login (`/lapor`) atau oleh Pengelola Pesantren; semua laporan wajib validasi pengelola sebelum tampil di dashboard.

## Akun demo frontend (core V2)

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

Lihat `CONTRIBUTING.md` untuk ketentuan kontribusi, `AGENTS.md` (dan `docs/v2/AGENTS.md` untuk branch `v2`) untuk aturan kerja, serta `docs/v2/` untuk spesifikasi produk V2 yang berlaku.
