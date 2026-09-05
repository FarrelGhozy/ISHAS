# Kesiapan Integrasi Backend ISHAS

Dokumen ini menjadi jembatan dari prototipe frontend ke implementasi backend. Bentuk data TypeScript yang menjadi pasangan dokumen ini tersedia di `apps/web/lib/ishas-contracts.ts`.

## Prinsip integrasi

1. Backend adalah sumber kebenaran untuk autentikasi, hak akses, versi instrumen, finalisasi, audit, file, scoring, rekomendasi, dan ekspor.
2. Frontend tidak boleh mengirim atau menerima data hanya berdasarkan label tampilan. Semua relasi memakai ID stabil.
3. Setiap permintaan harus divalidasi ulang berdasarkan pengguna, peran, dan lingkup lembaga/wilayah di backend.
4. Rumus, bobot, threshold, reverse scoring, missing-value rule, dan recommendation rule berasal dari konfigurasi ilmiah yang disahkan; bukan konstanta frontend.
5. Versi instrumen Published dan assessment Finalized bersifat immutable.
6. Semua waktu API menggunakan ISO 8601 dengan zona waktu; UI dapat menampilkan waktu Asia/Jakarta.
7. Semua list mendukung pagination, pencarian, filter, dan sort dari server.

## Bentuk respons umum

Respons berhasil:

```json
{
  "ok": true,
  "data": {},
  "requestId": "req_..."
}
```

Respons gagal:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data belum lengkap.",
    "fieldErrors": {
      "answers.IND-SAR-001": ["Bukti wajib belum tersedia."]
    },
    "requestId": "req_..."
  }
}
```

Kode minimum: `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `CONFLICT`, `LOCKED`, `UPLOAD_FAILED`, dan `INTERNAL_ERROR`.

## Autentikasi dan sesi

| Kebutuhan UI | Operasi backend | Catatan |
| --- | --- | --- |
| Login | `POST /auth/sign-in` | Mengembalikan user, role, permissions, dan scope ID. |
| Memulihkan sesi | `GET /auth/session` | Dipanggil sebelum workspace ditampilkan. |
| Logout | `POST /auth/sign-out` | Mengakhiri sesi server. |
| Notifikasi akun | `GET /notifications` | Hanya notifikasi milik user aktif. |
| Tandai dibaca | `PATCH /notifications/{id}/read` | Tidak boleh membaca notifikasi user lain. |

Sesi sebaiknya menggunakan cookie `HttpOnly`, `Secure`, dan `SameSite` yang sesuai. Token rahasia tidak disimpan di local storage.

## Matriks lingkup backend

| Peran | Lingkup minimum yang ditegakkan backend |
| --- | --- |
| Admin | Sistem, user, lembaga, role/permission, dan audit sesuai kebijakan organisasi. |
| Peneliti | Instrumen, versi, konfigurasi ilmiah, validasi, publish, dan data penelitian yang diizinkan. |
| Asesor | Penugasan sendiri, assessment yang ditugaskan, jawaban, serta bukti terkait. |
| Pengelola Pesantren | Hanya lembaga yang terhubung ke user: hasil, risiko, rekomendasi, tindak lanjut, dan laporan. |

Menyembunyikan menu bukan mekanisme keamanan. Setiap query dan mutation wajib memeriksa scope kembali.

## Admin

| Halaman | Endpoint minimum |
| --- | --- |
| Pengguna | `GET /users`, `POST /users`, `GET /users/{id}`, `PATCH /users/{id}` |
| Pesantren | `GET /institutions`, `POST /institutions`, `GET /institutions/{id}`, `PATCH /institutions/{id}` |
| Hak Akses | `GET /roles`, `GET /permissions`, `PATCH /roles/{id}/permissions` |
| Audit Log | `GET /audit-events`, `POST /exports/audit-events` |
| Pengaturan | `GET /system-settings`, `PATCH /system-settings` |

Perubahan user, role, permission, status lembaga, dan pengaturan penting membuat audit event berisi pelaku, waktu, alasan, nilai sebelum/sesudah, dan request ID.

## Peneliti dan instrumen

| Halaman | Endpoint minimum |
| --- | --- |
| Daftar instrumen | `GET /instruments`, `POST /instruments` |
| Versioning | `GET /instruments/{id}/versions`, `POST /instrument-versions` |
| Builder | `GET /instrument-versions/{id}`, `PUT /instrument-versions/{id}` |
| Dimensi | `POST/PATCH /instrument-versions/{id}/dimensions` |
| Indikator | `POST/PATCH /dimensions/{id}/indicators` |
| Validasi | `POST /instrument-versions/{id}/validate` |
| Publish | `POST /instrument-versions/{id}/publish` |
| Data penelitian | `GET /research-datasets`, `POST /exports/research-datasets` |
| Import dataset | `POST /research-dataset-imports`, `GET /research-dataset-imports/{id}`, `POST /research-dataset-imports/{id}/commit` |

Aturan wajib:

- Edit hanya diperbolehkan ketika versi berstatus Draft.
- Publish memeriksa kode versi unik, struktur dimensi/indikator, jenis jawaban, rule yang direferensikan, serta konfigurasi ilmiah wajib.
- Publish berjalan dalam transaksi, membuat audit event, menyimpan `publishedAt/publishedBy`, lalu mengunci versi.
- Perubahan versi Published dimulai dengan clone/new version yang menyimpan `parentVersionId`.
- Assessment menyimpan tepat satu `instrumentVersionId` dan, bila diperlukan, `scoringConfigHash`.

## Asesor dan assessment

| Langkah | Endpoint minimum |
| --- | --- |
| Penugasan saya | `GET /assessment-assignments?assessorUserId=me` |
| Mulai assessment | `POST /assessment-assignments/{id}/start` |
| Buka draft | `GET /assessments/{id}` |
| Simpan jawaban | `PUT /assessments/{id}/answers` |
| Unggah bukti | `POST /assessments/{id}/evidence` |
| Hapus bukti draft | `DELETE /evidence/{id}` |
| Sumber data pendukung | `GET/POST /assessments/{id}/input-sources` |
| Tinjau kelengkapan | `POST /assessments/{id}/validate` |
| Submit | `POST /assessments/{id}/submit` |
| Finalisasi | `POST /assessments/{id}/finalize` |
| Riwayat saya | `GET /assessments?assessorUserId=me` |

Progress dihitung backend dari field wajib yang lengkap, bukan dari halaman yang pernah dibuka. Evidence harus terhubung ke `assessmentId` dan, bila relevan, `answerId/indicatorId`.

`input-sources` membedakan kuesioner, observasi lapangan, dokumen/kebijakan, catatan insiden, dan sensor opsional. Payload spesifik tetap divalidasi berdasarkan tipe dan tidak menggantikan jawaban indikator.

Minimum lifecycle yang aman:

```text
Draft -> Submitted -> Finalized
```

Jika tim menetapkan proses verifikasi:

```text
Draft -> Submitted -> Under Review -> Finalized
                         -> Returned
```

Finalisasi harus atomik: validasi jawaban/bukti, kunci assessment, jalankan scoring versi yang benar, simpan hasil dan metadata, lalu tulis audit event. Koreksi data final membutuhkan endpoint khusus, alasan, izin, dan jejak lama-baru.

## Pengelola Pesantren

| Halaman | Endpoint minimum |
| --- | --- |
| Dashboard hasil | `GET /institutions/{id}/dashboard?period=...` |
| Hasil assessment | `GET /assessments/{id}/result` |
| Perbandingan periode | `GET /institutions/{id}/result-history` |
| Peta risiko | `GET /assessments/{id}/risk-observations` |
| Area/denah | `GET /institutions/{id}/areas`, `GET /floor-plans/{id}` |
| Rekomendasi | `GET /assessment-results/{id}/recommendations` |
| Buat tindak lanjut | `POST /recommendations/{id}/follow-ups` |
| Perbarui progress | `PATCH /follow-ups/{id}` |
| Bukti penyelesaian | `POST /follow-ups/{id}/evidence` |
| Ajukan verifikasi | `POST /follow-ups/{id}/submit-verification` |
| Laporan | `POST /assessments/{id}/reports`, `GET /reports/{id}` |

Risk observation menyimpan `areaId`, koordinat relatif opsional, assessment, indikator opsional, level/category, catatan, dan evidence. Frontend tidak mengasumsikan GIS. Denah awal dapat berupa gambar per lantai dengan koordinat relatif 0–100.

## File dan bukti

Alur yang disarankan:

1. Frontend meminta izin unggah atau mengirim multipart ke endpoint aplikasi.
2. Backend memeriksa role, scope, status Draft/Follow-up, MIME, ukuran, dan jumlah file.
3. File disimpan pada object storage; database hanya menyimpan metadata dan storage key.
4. Unduhan menggunakan URL bertanda tangan berumur pendek atau streaming melalui backend.
5. File tidak boleh memiliki URL publik permanen.
6. Penghapusan mengikuti status domain; bukti pada assessment Finalized tidak dihapus langsung.

## State UI yang harus dipetakan

| State frontend | Pemicu API | Respons UI |
| --- | --- | --- |
| Loading | Permintaan masih berjalan | Skeleton/spinner dan `aria-live`. |
| Empty | List berhasil tetapi `items=[]` | Penjelasan serta cara mengubah filter/membuat data. |
| Error | Gagal jaringan/server | Pesan ringkas, request ID, dan aksi coba lagi bila aman. |
| Forbidden | `403/FORBIDDEN` | Jelaskan batas akses; jangan bocorkan detail objek. |
| Success | Mutation berhasil | Feedback yang menyebut objek/status hasil. |
| Conflict | Versi data berubah | Minta muat ulang sebelum menyimpan ulang. |
| Locked | Published/Finalized | Alihkan ke hanya-baca atau versi/alur koreksi. |

Pola visual bersama tersedia pada `components/ui/data-state.tsx`.

## Strategi penggantian mock ke API

1. Implementasikan `IshasApi` dari `apps/web/lib/ishas-contracts.ts` menggunakan fetch client.
2. Buat satu provider/query layer untuk session dan request state.
3. Pindahkan data dummy dari komponen ke mock adapter yang juga mengimplementasikan `IshasApi`.
4. Ganti mock adapter dengan HTTP adapter tanpa mengubah props komponen halaman.
5. Tambahkan cache invalidation setelah mutation, optimistic update hanya untuk aksi yang aman, dan idempotency key untuk finalisasi/publish/report.
6. Uji role/scope pada backend dan frontend; pengujian backend tetap menjadi kontrol utama.

## Keputusan yang masih wajib dari tim

- Dimensi, indikator, jenis jawaban, bobot, rubric, dan sumber resmi.
- Formula normalisasi, indeks komposit, reverse scoring, missing value, N/A, dan threshold risiko.
- Workflow assessment setelah Submit: langsung Final atau melalui reviewer.
- Pihak yang berhak memverifikasi tindak lanjut.
- Kebijakan retensi, ukuran, format, dan akses bukti.
- Apakah denah diunggah per pesantren/lantai dan siapa yang menentukan titik koordinat.
- Format laporan final dan pihak yang boleh mengunduh data mentah.
- Target hosting, SSO/email invitation, backup, observability, dan SLA.

Item tersebut tidak menghalangi validasi UI, tetapi harus selesai sebelum backend produksi dan scoring final dinyatakan lengkap.
