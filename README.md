# ISHAS

Integrated Safety and Health Assessment System adalah prototipe sistem penilaian K3L untuk pesantren. Tahap saat ini berfokus pada validasi tampilan dan fitur menggunakan data dummy. Backend dan formula ilmiah final belum diimplementasikan.

Refactor frontend sebelum backend dibagi menjadi dua tahap: Stage 09 untuk URL routing, shared shell, sesi login dummy, dan guard akses; kemudian Stage 10 untuk modularisasi fitur serta penyatuan data dummy lintas role. Status rinci tersedia di `planning/README.md` dan `TODO.md`.

## Struktur repository

- `apps/web` — prototipe frontend React dan TypeScript.
- `docs/source` — proposal asli sebagai sumber penelitian.
- `docs/blueprint` — blueprint, spesifikasi, dan guardrail engineering.
- `docs/planning` — checklist requirement dan rencana pengembangan.
- `docs/decisions` — keputusan desain dan teknis yang sudah disetujui.
- `planning` — local issue management dan stage implementasi frontend.
- `flow.md` — flow penggunaan utama, flow per peran, serta audit celah antarfitur.
- `TODO.md` — kontrol pekerjaan yang sedang aktif.
- `AGENTS.md` — aturan tetap untuk pekerjaan di repository.

## Menjalankan frontend

```bash
cd apps/web
bun install
bun run dev
```

Pemeriksaan teknis frontend dapat dijalankan dengan `bun run lint`, `bun run test`, dan `bun run build`. Data dummy tersimpan di browser selama demo dan dapat dikembalikan ke seed awal melalui Pengaturan Admin.

## Akun demo frontend

Semua akun menggunakan kata sandi `demo1234`.

| Peran | Email | Fokus |
| --- | --- | --- |
| Admin | `admin@ishas.demo` | Sistem, akun, lembaga, akses, dan audit |
| Peneliti | `peneliti@ishas.demo` | Ilmu, instrumen, versi, dan scoring |
| Asesor | `asesor@ishas.demo` | Assessment dan bukti lapangan |
| Pengelola Pesantren | `pengelola@ishas.demo` | Hasil, rekomendasi, dan tindak lanjut |

## Status data

Semua angka, skor, kategori, indikator, dan isi assessment di frontend saat ini adalah data dummy. Data tersebut tidak boleh dianggap sebagai hasil penelitian atau formula ISHAS final.

## Aturan utama

1. Instrumen ilmiah tidak di-hard-code sebagai kebenaran final.
2. Versi instrumen Published tidak diubah langsung.
3. Assessment final selalu terkait dengan versi instrumen dan konfigurasi scoring.
4. Perubahan yang memengaruhi hasil historis harus memiliki versioning dan audit trail.
5. Identitas commit mengikuti konfigurasi Git milik pemilik repository. Jangan menambahkan atribusi AI atau `Co-authored-by`.

Lihat `CONTRIBUTING.md` dan `docs/FRONTEND_RULES.md` untuk ketentuan lebih rinci.
