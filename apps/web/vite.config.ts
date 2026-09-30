import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [reactRouter(), tailwindcss(), tsconfigPaths()],
  // Baca `.env` root repo agar `VITE_USE_BACKEND`/`VITE_API_BASE` ikut
  // (hanya variabel ber-prefix VITE_ yang diekspos ke klien).
  envDir: "../../",
  server: {
    host: "0.0.0.0",
    // Proxy same-origin ke backend Bun (D-30) saat `VITE_USE_BACKEND=true`.
    // Host/port backend diambil dari `.env` (`API_PROXY_HOST`/`API_PORT`).
    proxy: {
      "/api": {
        target: `http://${process.env.API_PROXY_HOST ?? "127.0.0.1"}:${process.env.API_PORT ?? "3004"}`,
        changeOrigin: true,
      },
    },
    // Samakan dengan Docker: container dev listen di Web dev container port
    // (`WEB_DEV_CONTAINER_PORT` di docker-compose.yml), host dipetakan dari
    // WEB_PORT. Lokal default 3003; ubah via `PORT=` standar Vite bila perlu.
    port: Number(process.env.PORT ?? process.env.WEB_DEV_CONTAINER_PORT ?? 3003),
    allowedHosts: [
      // Host dasar selalu diizinkan.
      "localhost",
      "127.0.0.1",
      // Tambahan host via env (koma, mis. `VITE_ALLOWED_HOSTS=a.id,b.id`).
      // Di Docker terisi dari `.env` root via `env_file`; lokal via shell.
      ...(process.env.VITE_ALLOWED_HOSTS ?? "")
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean),
    ],
  },
});
