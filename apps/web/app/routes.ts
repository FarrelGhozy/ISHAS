// Peta route aplikasi ISHAS — docs ROUTES.md. URL adalah sumber kebenaran halaman aktif.
// Semua route publik memakai shell publik ringan; workspace memakai satu shell + guard peran.

import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  // Standalone (tanpa shell)
  route("login", "routes/login.tsx"),
  route("akses-ditolak", "routes/akses-ditolak.tsx"),

  // Publik (shell ringan; isi sama untuk semua sesi)
  layout("routes/_public.tsx", [
    index("routes/home.tsx"),
    route("lapor", "routes/lapor.tsx"),
    route("penilaian-mandiri", "routes/penilaian-mandiri.tsx"),
    route("hasil", "routes/hasil.tsx"),
    route("peta-risiko", "routes/peta-risiko.tsx"),
    route("rekomendasi", "routes/rekomendasi.tsx"),
    route("tindak-lanjut", "routes/tindak-lanjut.tsx"),
    route("laporan", "routes/laporan.tsx"),
    route("pesantren/:kode", "routes/pesantren.$kode.tsx"),

    // Sisa URL lama dari V1 (penanganan penghentian, bukan workspace aktif)
    route("asesor/*", "routes/asesor.tsx"),
  ]),

  // Workspace (wajib login + peran cocok; guard di shell). Layout file dibagikan tiga cabang.
  route("admin", "routes/_workspace.admin.tsx", [
    index("routes/admin.index.tsx"),
    route("dashboard", "routes/admin.dashboard.tsx"),
    route("pengguna", "routes/admin.pengguna.tsx"),
    route("pesantren", "routes/admin.pesantren.tsx"),
    route("hak-akses", "routes/admin.hak-akses.tsx"),
    route("audit-log", "routes/admin.audit-log.tsx"),
    route("pengaturan", "routes/admin.pengaturan.tsx"),
  ]),
  route("peneliti", "routes/_workspace.peneliti.tsx", [
    index("routes/peneliti.index.tsx"),
    route("dashboard", "routes/peneliti.dashboard.tsx"),
    route("instrumen", "routes/peneliti.instrumen.tsx"),
    route("versioning", "routes/peneliti.versioning.tsx"),
    route("scoring", "routes/peneliti.scoring.tsx"),
    route("validasi-publikasi", "routes/peneliti.validasi-publikasi.tsx"),
    route("data-penelitian", "routes/peneliti.data-penelitian.tsx"),
  ]),
  route("pengelola", "routes/_workspace.pengelola.tsx", [
    index("routes/pengelola.index.tsx"),
    route("validasi-laporan", "routes/pengelola.validasi-laporan.tsx"),
    route("lokasi", "routes/pengelola.lokasi.tsx"),
    route("tindak-lanjut", "routes/pengelola.tindak-lanjut.tsx"),
    route("laporan", "routes/pengelola.laporan.tsx"),
  ]),

  // Route tidak dikenal
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
