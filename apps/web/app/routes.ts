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
    route("laporan/:id", "routes/laporan.$id.tsx"),
    route("dokumen", "routes/dokumen.tsx"),
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
  route("validator", "routes/_workspace.validator.tsx", [
    index("routes/validator.index.tsx"),
    route("dashboard", "routes/validator.dashboard.tsx"),
    route("sam-isafe", "routes/validator.sam-isafe.tsx"),
    route("sam-isafe/baru", "routes/validator.sam-isafe.baru.tsx"),
    route("sam-isafe/bank", "routes/validator.sam-isafe.bank.tsx"),
    route("sam-isafe/:id", "routes/validator.sam-isafe.$id.tsx"),
    route("instrumen", "routes/validator.instrumen.tsx"),
    route("dokumen-instrumen", "routes/validator.dokumen-instrumen.tsx"),
    route("versioning", "routes/validator.versioning.tsx"),
    route("scoring", "routes/validator.scoring.tsx"),
    route("validasi-publikasi", "routes/validator.validasi-publikasi.tsx"),
    route("data-penelitian", "routes/validator.data-penelitian.tsx"),
  ]),
  route("pesantren", "routes/_workspace.pesantren.tsx", [
    index("routes/pesantren.index.tsx"),
    route("validasi-laporan", "routes/pesantren.validasi-laporan.tsx"),
    route("lokasi", "routes/pesantren.lokasi.tsx"),
    route("tindak-lanjut", "routes/pesantren.tindak-lanjut.tsx"),
    route("laporan", "routes/pesantren.laporan.tsx"),
  ]),

  // Alih URL lama D-17: /peneliti/* → /validator/*, /pengelola/* → /pesantren/*
  route("peneliti/*", "routes/redirect-validator.tsx"),
  route("pengelola/*", "routes/redirect-pesantren.tsx"),

  // Route tidak dikenal
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
