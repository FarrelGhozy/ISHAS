import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [reactRouter(), tailwindcss(), tsconfigPaths()],
  server: {
    host: "0.0.0.0",
    port: 3003,
    allowedHosts: ["ishas.utc.web.id", ".ishas.utc.web.id", "localhost", "127.0.0.1"],
  },
});
