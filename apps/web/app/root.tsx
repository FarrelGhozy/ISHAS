import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "react-router";
import type { Route } from "./+types/root";

import "./app.css";

export const meta: Route.MetaFunction = () => [
  { title: "ISHAS — Dashboard K3L Pesantren" },
  {
    name: "description",
    content:
      "ISHAS: penilaian K3L pesantren. Dashboard publik, lapor cepat, dan penilaian mandiri. Data ilustrasi prototipe frontend.",
  },
];

// Ikon disamakan dengan HIBAH_INTERNAL/apps/web/public (favicon + PNG + apple-touch).
export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.ico", sizes: "any" },
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  { rel: "icon", href: "/icon-32.png", sizes: "32x32", type: "image/png" },
  { rel: "icon", href: "/icon-192.png", sizes: "192x192", type: "image/png" },
  { rel: "icon", href: "/icon-512.png", sizes: "512x512", type: "image/png" },
  { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function RootError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "Terjadi kesalahan tak terduga.";
  // Pemulihan data demo rusak: hapus mock tersimpan lalu muat ulang.
  const resetDemoAndReload = () => {
    try {
      for (let i = 0; i < localStorage.length;) {
        const key = localStorage.key(i);
        if (key && key.startsWith("ishas-mock-v")) {
          localStorage.removeItem(key);
        } else {
          i += 1;
        }
      }
    } catch {
      // Penyimpanan tak dapat dibaca; tetap coba muat ulang.
    }
    window.location.reload();
  };
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="surface max-w-md p-8 text-center">
        <h1 className="text-lg font-extrabold text-heading">Terjadi kesalahan</h1>
        <p className="mt-2 text-xs text-secondary-text">{message}</p>
        <p className="mt-2 text-xs text-secondary-text">
          Bila galat berulang setelah muat ulang, data demo di perangkat ini
          mungkin rusak dan dapat dikembalikan ke awal.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            className="primary-button"
            onClick={() => window.location.reload()}
          >
            Muat ulang
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={resetDemoAndReload}
          >
            Kembalikan data demo
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Root() {
  return <Outlet />;
}

export function HydrateFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <p className="text-xs font-semibold text-secondary-text">Menyiapkan halaman…</p>
    </div>
  );
}

export { RootError as ErrorBoundary };
