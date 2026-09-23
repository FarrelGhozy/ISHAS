import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [reactRouter(), tailwindcss(), tsconfigPaths()],
  server: {
    host: "0.0.0.0",
    // Samakan dengan Docker: container dev listen di 3003 (target tetap di
    // `docker-compose.yml`), host dipetakan dari WEB_PORT. Lokal default 3003;
    // ubah via `PORT=` standar Vite bila perlu (WEB_PORT hanya arti port host).
    port: Number(process.env.PORT ?? 3003),
    allowedHosts: [
      "ishas.utc.web.id",
      ".ishas.utc.web.id",
      "localhost",
      "127.0.0.1",
      // Tambahan host via env (koma, mis. `VITE_ALLOWED_HOSTS=a.id,b.id`).
      // Di Docker terisi dari `.env` root via `env_file`; lokal via shell/`apps/web/.env`.
      ...(process.env.VITE_ALLOWED_HOSTS ?? "")
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean),
    ],
  },
});
