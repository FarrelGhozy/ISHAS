# Aturan kontribusi ISHAS

## Commit

- Gunakan identitas Git pribadi yang sudah dikonfigurasi pada komputer pemilik repository.
- Dilarang menambahkan identitas bot, AI, atau baris `Co-authored-by` otomatis.
- Satu commit berisi satu perubahan yang jelas dan dapat ditinjau.
- Format pesan: `type(scope): ringkasan singkat`.
- Type yang digunakan: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`.
- Contoh: `feat(frontend): add assessment prototype flow`.

## Branch

- `main` hanya untuk versi yang stabil atau sudah disetujui.
- Gunakan `feat/nama-fitur`, `fix/nama-bug`, atau `docs/nama-dokumen` untuk pekerjaan terpisah.

## Pull request dan review

- Jelaskan tujuan, bagian yang berubah, cara memeriksa, dan keputusan yang masih terbuka.
- Sertakan tangkapan layar untuk perubahan tampilan.
- Jangan menggabungkan perubahan yang menetapkan rumus ilmiah tanpa persetujuan tim penelitian.

## Sebelum commit

```bash
cd apps/web
bun run lint
bun run build
```
