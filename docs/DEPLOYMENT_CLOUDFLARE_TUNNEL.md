# Deployment ISHAS via Cloudflare Tunnel

Panduan menjalankan ISHAS dalam mode rilis (profile `prod`) dan mengeksposnya
lewat Cloudflare Tunnel. Ada dua arsitektur: **satu domain** (disarankan) dan
**domain API terpisah** (opsional).

- Mode rilis memakai image `api-prod` (`NODE_ENV=production`) dan `web-prod`
  (nginx statis). Kartu login demo **mati**; masuk memakai email + kata sandi.
- Semua environment diatur di `.env` root, bukan di-hardcode.

## 1. Arsitektur satu domain (disarankan)

```
Internet ──HTTPS──> Cloudflare edge ──Tunnel──> cloudflared ──http──> web-prod (nginx)
                                                                        ├── "/"        → SPA statis
                                                                        └── "/api/..." → api-prod:3004
                                                                                          └── db:3306
```

- Browser hanya mengenal **satu origin**: `https://ishas.utc.web.id`.
- `web-prod` mem-proxy `/api/` ke `api-prod` (`apps/web/nginx.conf`, `location /api/`).
- Frontend memakai `VITE_API_BASE=/api/v1` (relatif), jadi otomatis mengarah ke
  origin yang sama. Tidak perlu CORS, cookie `SameSite=Lax` tetap sah.

Port di server:

| Port host | Service | Publik? |
| --- | --- | --- |
| `WEB_PORT` (3003) | `web-prod` nginx | Ya — target tunnel |
| `API_PORT` (3004) | `api-prod` | Tidak (hanya `web-prod`) |
| `DB_PORT` (3306) | `db` MySQL | Tidak |

## 2. Prasyarat

1. Server Linux dengan Docker + Docker Compose.
2. Domain aktif di Cloudflare (mis. `utc.web.id`).
3. Tunnel Cloudflare (`cloudflared`) sudah dibuat (Zero Trust → Networks → Tunnels).
4. Repo ISHAS tersalin di server.

## 3. Konfigurasi `.env`

Salin dari contoh jika belum ada: `cp .env.example .env`. Nilai penting untuk
rilis di balik HTTPS:

| Variabel | Nilai | Keterangan |
| --- | --- | --- |
| `COMPOSE_PROFILES` | `prod` | profile rilis |
| `VITE_USE_BACKEND` | `true` | frontend memakai API server |
| `VITE_API_BASE` | `/api/v1` | relatif (satu domain) |
| `COOKIE_SECURE` | `true` | cookie sesi hanya lewat HTTPS |
| `VITE_ALLOWED_HOSTS` | `ishas.utc.web.id` | host tambahan (untuk dev server) |
| `SEED_DEFAULT_PASSWORD` | sandi kuat | kata sandi awal akun seed |
| `DB_PASSWORD` / `DB_ROOT_PASSWORD` | sandi kuat | keamanan database |
| `CORS_ALLOWED_ORIGINS` | *(kosong)* | hanya untuk domain API terpisah (§7) |
| `COOKIE_DOMAIN` | *(kosong)* | hanya untuk domain API terpisah (§7) |

> Catatan: `VITE_*` **dibakar saat build**. Setiap mengubahnya, rebuild `web-prod`
> (`docker compose --profile prod build web-prod`).

## 4. Build & jalankan

```bash
# 1) Build image rilis lalu jalankan db + api-prod + web-prod
docker compose --profile prod up -d --build

# 2) Siapkan skema database
docker compose --profile prod run --rm api-prod bun run migrate

# 3) Isi data (pilih salah satu)
docker compose --profile prod run --rm api-prod bun run seed:demo    # data contoh lengkap
docker compose --profile prod run --rm api-prod bun run seed:empty   # hanya akun inti
```

Cek cepat di server:

```bash
curl -s http://localhost:3003/api/v1/health
# {"ok":true,"data":{"status":"ok","db":"ok",...}}
```

## 5. Cloudflare Tunnel

### 5a. Lewat dashboard (paling mudah)

Zero Trust → Networks → Tunnels → pilih tunnel → **Public Hostnames** → Add:

| Field | Nilai |
| --- | --- |
| Subdomain | `ishas` |
| Domain | `utc.web.id` |
| Path | *(kosong)* |
| Type | `HTTP` |
| URL | `localhost:3003` |

Lalu simpan dan akses `https://ishas.utc.web.id`.

### 5b. cloudflared di host (config.yml)

```yaml
tunnel: <UUID>
credentials-file: /root/.cloudflared/<UUID>.json
ingress:
  - hostname: ishas.utc.web.id
    service: http://localhost:3003
  - service: http_status:404
```

```bash
cloudflared tunnel route dns <nama-tunnel> ishas.utc.web.id
cloudflared tunnel run <nama-tunnel>
```

### 5c. cloudflared sebagai service Compose (opsional)

Tambahkan ke `docker-compose.yml` bila ingin tunnel ikut Compose:

```yaml
  cloudflared:
    image: cloudflare/cloudflared:latest
    command: tunnel --no-autoupdate run
    environment:
      TUNNEL_TOKEN: ${CLOUDFLARE_TUNNEL_TOKEN}
    depends_on:
      - web-prod
    profiles:
      - tunnel
```

Isi `CLOUDFLARE_TUNNEL_TOKEN` di `.env` (dari dashboard Cloudflare), lalu:

```bash
docker compose --profile prod --profile tunnel up -d
```

Di dashboard, arahkan public hostname ke service internal `http://web-prod:80`
(masih satu jaringan Compose).

## 6. Verifikasi

- `https://ishas.utc.web.id/` → dashboard publik termuat.
- Deep link seperti `/hasil`, `/lapor`, `/login` langsung termuat (SPA fallback).
- `https://ishas.utc.web.id/api/v1/health` → `db: ok`.
- Login `admin@ishas.demo` + `SEED_DEFAULT_PASSWORD` di `https://ishas.utc.web.id/login`.
- Di DevTools → Application → Cookies: `ishas_session` punya tanda `Secure`.

## 7. Opsi: domain API terpisah (mis. `api-ishas.utc.web.id`)

Pilih ini hanya bila memang ingin memisahkan backend. Perlu **dua hostname** dan
**tiga perubahan konfigurasi**; tanpa itu login/aksi tulis akan gagal.

### 7a. Hostname kedua

Tambahkan public hostname:

| Subdomain | Domain | Type | URL |
| --- | --- | --- | --- |
| `ishas` | `utc.web.id` | HTTP | `localhost:3003` |
| `api-ishas` | `utc.web.id` | HTTP | `localhost:3004` |

### 7b. Env backend (`.env`)

```dotenv
# Izinkan frontend memanggil API lintas origin (CORS).
CORS_ALLOWED_ORIGINS=https://ishas.utc.web.id
# Samakan domain cookie agar cookie CSRF dapat dibaca JS frontend.
COOKIE_DOMAIN=.utc.web.id
```

### 7c. Env frontend + rebuild

```dotenv
VITE_API_BASE=https://api-ishas.utc.web.id/api/v1
```

```bash
docker compose --profile prod up -d --build
```

**Kenapa perlu ini:**
- CORS: dua origin berbeda (`ishas...` vs `api-ishas...`) → browser butuh header
  `Access-Control-Allow-*`; backend menambahkannya bila `CORS_ALLOWED_ORIGINS` diisi
  (`apps/api/src/app.ts`).
- `COOKIE_DOMAIN`: cookie CSRF dipasang host API dan dibaca JS frontend
  (`apps/web/shared/api/http-client.ts`) → harus di domain induk `.utc.web.id`.
- `SameSite=Lax` tetap dipakai karena kedua subdomain masih **satu site**
  (`utc.web.id`), jadi cookie sesi terkirim tanpa perlu `SameSite=None`.

## 8. Operasional

| Kebutuhan | Perintah |
| --- | --- |
| Ganti seed | `docker compose --profile prod run --rm api-prod bun run seed:demo` |
| Migrasi baru | `docker compose --profile prod run --rm api-prod bun run migrate` |
| Reset total DB (hati-hati) | `docker compose --profile prod run --rm api-prod bun run migrate --fresh` |
| Build ulang setelah ubah kode | `docker compose --profile prod up -d --build` |
| Lihat log | `docker compose --profile prod logs -f api-prod web-prod` |
| Hentikan | `docker compose --profile prod down` |

## 9. Troubleshooting

| Gejala | Penyebab / solusi |
| --- | --- |
| `502` dari Cloudflare | `web-prod` belum jalan atau tunnel menunjuk port salah. Cek `docker compose ps` dan `curl http://localhost:3003`. |
| Login berhasil tapi sesi hilang | `COOKIE_SECURE=true` tetapi diakses via `http://`; atau domain cookie tidak cocok. |
| `CORS error` di console | Dua domain dipakai tetapi `CORS_ALLOWED_ORIGINS` belum diisi/link frontend salah. |
| Aksi tulis `403` "Permintaan tidak sah" | Cookie CSRF tidak terbaca (dua domain tanpa `COOKIE_DOMAIN`). |
| Unggah gagal > 25 MB | Batas nginx `client_max_body_size 25m`; Cloudflare free membatasi unggahan 100 MB. |
| Deploy baru tidak muncul | Cache HTML; `index.html` sudah `no-store`, pastikan Cloudflare tidak meng-cache dengan aturan khusus. |

## 10. Keamanan produksi

- Ganti `SEED_DEFAULT_PASSWORD`, `DB_PASSWORD`, dan `DB_ROOT_PASSWORD` dari nilai contoh.
- Batasi `db` dan `api-prod` ke localhost agar tidak terbuka ke internet, mis.
  ubah port mapping menjadi `127.0.0.1:${DB_PORT}:3306` dan
  `127.0.0.1:${API_PORT}:${API_PORT}` di `docker-compose.yml`.
- Jangan pernah mem-publish port `3306` (MySQL) ke publik.
- Cadangkan volume `db-data` dan `api-storage` secara berkala.
