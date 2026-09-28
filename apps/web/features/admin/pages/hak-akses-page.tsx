// Matriks hak akses baca — sumber: docs ROLES.md §6. Super Admin hanya membaca
// matriks ini; perubahan hak menunggu keputusan produk.
export function Page() {
  const rows: { role: string; items: string[] }[] = [
    {
      role: "Publik / Pelapor",
      items: [
        "Baca dashboard, hasil, peta, rekomendasi, tindak lanjut, laporan (ringkasan + nama validator/PIC).",
        "Kirim laporan cepat + penilaian mandiri tanpa login.",
      ],
    },
    {
      role: "Pesantren",
      items: [
        "Validasi laporan scope sendiri (Terima wajib severity/priority, Tolak wajib alasan).",
        "Kelola lokasi, denah, tindak lanjut, batalkan perbaikan, baca laporan scope sendiri.",
      ],
    },
    {
      role: "Validator",
      items: [
        "Kelola bank instrumen live, bobot jawaban, audit skor, audit publikasi, dataset penelitian.",
        "Tidak memvalidasi laporan dan tidak mengelola pesantren/akun.",
      ],
    },
    {
      role: "Super Admin",
      items: [
        "Kelola pesantren (Persiapan/Aktif/Nonaktif), akun (Menunggu/Aktif/Nonaktif), audit global, pengaturan demo.",
        "Tidak memvalidasi laporan, tidak mengisi severity/priority, tidak menyentuh instrumen.",
      ],
    },
  ];
  return (
    <section className="flex flex-col gap-4">
      <header>
        <p className="kicker">Administrasi</p>
        <h1 className="text-2xl font-extrabold text-heading">Hak akses</h1>
        <p className="text-sm text-secondary-text">
          Matriks baca tiga peran login + publik. Guard frontend hanya simulasi UX.
        </p>
      </header>
      <div className="surface divide-y divide-line">
        {rows.map(({ role, items }) => (
          <div className="p-4" key={role}>
            <strong className="text-heading">{role}</strong>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-secondary-text">
              {items.map((item) => (
                <li key={item}>
                  <span aria-hidden>• </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
