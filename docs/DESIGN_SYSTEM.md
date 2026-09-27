# Sistem Desain

> Aturan: seluruh hex di bawah ditetapkan di `apps/web/app/app.css`. Implementasi wajib memakai token ini; warna bahaya tidak dipakai sebagai warna identitas.

**Catatan terkini:** D-18 mengganti identitas marun pada D-13 dengan biru. Ketentuan
tema/warna tetap pada catatan historis sebelumnya tidak lagi berlaku untuk identitas.
**Catatan historis validasi rencana:** token ini adalah acuan visual yang ditetapkan. Pemilik masih membahas;
detail layout, ukuran teks, dan copy belum disetujui ulang (D-12). Pemeriksaan dokumentasi
bukan bukti bahwa tampilan atau aksesibilitasnya sudah lulus pengujian.

## 1. Token warna (hex persis)

### Identitas (biru — pemilik tunggal identitas ISHAS)

| Token | Hex | Pakai untuk |
|---|---|---|
| `--primary` / tombol utama | `#007EFF` | Background + border `primary-button`, border-top `stat-card`, ikon scope |
| Hover tombol utama | `#0066CC` | `primary-button:hover` |
| Aksen biru (grafik/ikon) | `#3498DB` | Ikon scope-banner, stroke grafik tren, ikon permission |
| Ring/fokus | `#007EFF` | `--ring` fokus keyboard |
| Gradien panel login | `#063A73 → #0066CC → #007EFF` | Background `.login-story` 145deg |
| Border/banner bernuansa biru | `#BAE6FD` | Border `scope-banner`, `version-card` |
| Background banner | `#EFF6FF` | `scope-banner` |
| Hover sekunder | `#EFF6FF` bg + `#7DD3FC` border + `#007EFF` teks | `secondary-button:hover` |

### Teks dan permukaan

| Token | Hex | Pakai untuk |
|---|---|---|
| Background aplikasi | `#f5f7fb` | `body` |
| Judul | `#2A3F54` | Heading, nilai statistik |
| Tubuh | `#334155` | Teks tombol sekunder, isi |
| Sekunder | `#64748b` | Label kecil, deskripsi |
| Muted | `#94a3b8` | Placeholder, hint |
| Border netral | `#e2e8f0` | Border `surface`, `stat-card`, divider |
| Border lembut | `#cbd5e1` | Border `secondary-button` |
| Permukaan | `#ffffff` | `surface`, kartu, dialog |
| Latar strip | `#eef2f6` / `#f8fafc` / `#f1f5f9` | Baris tabel, chip netral |

### Status (selalu label teks + ikon, tidak pernah warna saja)

| Kelas | Background | Teks | Ikon Lucide | Gaya |
|---|---|---|---|---|
| `status-red` | `#fee2e2` | `#b91c1c` | `AlertTriangle`/`Flame` | Teks 12px tebal + ikon, radius 4px, padding 4px 7px |
| `status-amber` | `#fff3d6` | `#b45309` | `Clock3` | idem |
| `status-green` | `#dff7ed` | `#047857` | `CheckCircle2` | idem |
| `status-blue` | `#dff3f7` | `#0d5c75` | `Info`/`Activity` | idem |
| `status-neutral` | `#eef2f6` | `#64748b` | `Clock3`/`X` | idem |

Aksen kartu statistik: atas merah `#dc2626` (`stat-red`), ambar `#d97706` (`stat-amber`), default biru `#007EFF`. Tren naik: teks `#047857` (`trend-up`).

## 2. Pemetaan status → kelas + ikon + label (rancangan untuk review)

| Nilai data | Kelas | Ikon | Label tampil |
|---|---|---|---|
| Severity/Priority `Tinggi` | `status-red` | `AlertTriangle` | `Tinggi` |
| Level risiko `Ekstrem` (D-15.b, prototipe) | `status-red` | `Flame` | `Ekstrem` |
| Severity/Priority `Sedang` | `status-amber` | `AlertTriangle` | `Sedang` |
| Severity/Priority `Rendah` | `status-green` | `CheckCircle2` | `Rendah` |
| Keduanya `Belum ditentukan` | `status-neutral` | `Minus` | `Belum ditentukan` |
| Handling `Menunggu validasi` | `status-neutral` | `Clock3` | `Menunggu validasi` |
| Handling `Pending` | `status-amber` | `Clock3` | `Pending` |
| Handling `Proses` | `status-blue` | `Activity` | `Proses` |
| Handling `Completed`/`Terverifikasi` | `status-green` | `CheckCircle2` | `Completed` / `Terverifikasi` |
| Tindak lanjut `Dibatalkan` (D-21) | `status-neutral` | `X` | `Dibatalkan` |
| Validation `Ditolak` | `status-neutral` | `X` | `Ditolak` |
| Kanal `lapor-cepat` | `status-blue` | `Megaphone` | `Lapor cepat` |
| Kanal `penilaian-mandiri` | `status-blue` | `ClipboardCheck` | `Penilaian mandiri` |
| Visibilitas `Public` (D-16) | `status-green` | `CheckCircle2` | `Public` |
| Visibilitas `Privat` (D-16) | `status-neutral` | `Lock` | `Privat` |
| `Data publik · ilustrasi` | `status-blue` | `Info` | teks persis itu |

## 3. Komponen (gaya yang ditetapkan, dipakai ulang tanpa redesign)

- **Tombol utama** (`primary-button`): tinggi min 44px, radius 7px, bg `#007EFF`, teks putih 14px/700, ikon 15px, shadow `0 2px 4px rgb(15 23 42 / 9%)`; disabled: redup + non-klik.
- **Tombol sekunder** (`secondary-button`): min 44px, border `#cbd5e1`, bg putih, teks `#334155` 14px/700; hover biru lembut (lihat tabel).
- **Tombol teks** (`text-button`): untuk link aksi ("Buka peta bahaya →").
- **Kartu** (`surface`): border `#e2e8f0`, radius 8px, bg putih, shadow `0 1px 2px rgb(15 23 42 / 3%)`.
- **Banner scope**: border `#BAE6FD`, bg `#EFF6FF`, radius 8px, ikon `#3498DB` 18px.
- **Grafik tren**: stroke `#3498DB` 3px, fill gradien `#3498DB` 24% → 0, grid `#e2e8f0`, label `#64748b` 11px; tinggi minimum 225px.
- **Tipografi**: Inter/system; kicker kecil uppercase; H1 halaman 20–24px/800; label form 11px/700; hint 12px `#64748b`; error 12px `#b91c1c` + ikon.

## 4. Aturan aksesibilitas (wajib)

1. Status bahaya selalu label + ikon (aturan produk). Jangan mengandalkan merah saja.
2. Periksa kontras setiap pasangan teks/latar pada ukuran aktual saat review tampilan; jangan menganggap seluruh kombinasi otomatis lulus karena berasal dari lama. Ukuran badge kecil dan label pada salinan lama perlu pemeriksaan keterbacaan bersama D-12.
3. Fokus keyboard terlihat (ring `#007EFF`); urutan Tab: header → pemilih pesantren → CTA → konten; dialog moderasi menjebak fokus sampai ditutup (Esc menutup).
4. Area sentuh min 40px di ponsel untuk tombol validasi/terima/tolak.

## 5. Yang BOLEH ditambah di (di luar salinan lama)

1. Kelas `.status` baru TIDAK boleh dibuat — pakai lima kelas di atas.
2. Ikon baru hanya dari set Lucide yang sudah dipakai (Plus, MapPin, Camera, Upload, Check, X, Info, Megaphone, ClipboardCheck, Activity, Clock3).
3. Ilustrasi/empty-state memakai garis netral `#e2e8f0` + teks `#64748b`; dilarang menambah warna merek baru.

Daftar ikon pada §5 adalah contoh, bukan larangan ikon yang sudah dicantumkan pada tabel status
dan wireframe (misalnya `AlertTriangle`, `ShieldCheck`, `Minus`). Pilihan akhir harus konsisten.
`Completed` dan `Terverifikasi` dapat berbagi gaya, tetapi tetap mewakili status objek yang berbeda.
