// Seed "inti" (mode `empty`): akun inti untuk inisial awal + dua pesantren
// terdaftar (PP Al-Hikmah Malang + UNIDA Gontor, D-48) + bank instrumen penilaian
// mandiri penuh (6 dimensi/59 indikator, D-44). Seluruh data display (laporan,
// temuan, rekomendasi, SAM, denah, dokumen, audit, notifikasi) sengaja KOSONG.
// Lihat BACKEND_DATA_MODEL §10.

import { K3_CATEGORIES } from "../../../web/mocks/kategori-k3";
import { BANK_ID, buildBankLiveDariVersi } from "../../../web/mocks/instrument-bank";
import { buildInstrumentV2Dimensions, INSTRUMEN_V2_ID } from "../../../web/mocks/seed/instrument-v2";
import { hashPassword } from "../auth/password";
import { seedDefaultPassword } from "../config";
import { insertRows, json, truncateAll, type SqlValue } from "./helpers";

// D-44: bank live penuh diturunkan dari instrumen v2 (soal + opsi + bobot bawaan).
const liveInstrument = buildBankLiveDariVersi({
  id: INSTRUMEN_V2_ID,
  label: "ISHAS v2.0",
  status: "Published",
  publishedAt: "2026-09-30T00:00:00.000Z",
  dimensions: buildInstrumentV2Dimensions(),
});

export async function seedEmpty(): Promise<void> {
  await truncateAll();

  await insertRows(
    "k3_categories",
    ["id", "name", "sort_order"],
    K3_CATEGORIES.map((c, index) => [c.id, c.name, index + 1]),
  );
  await insertRows(
    "k3_aspects",
    ["id", "category_id", "name", "sort_order"],
    K3_CATEGORIES.flatMap((c) => c.aspects.map((a, index) => [a.id, a.categoryId, a.name, index + 1])),
  );

  // Dua pesantren terdaftar (UNIDA paling atas via `created_at`, D-48) agar akun
  // Pesantren inti punya scope yang sah. Tanpa data dummy.
  await insertRows(
    "institutions",
    ["code", "name", "city", "address", "manager", "status", "created_at"],
    [
      [
        "PSN-0024",
        "UNIDA Gontor",
        "Kabupaten Ponorogo",
        "Jl. Raya Siman Km. 5, Siman, Kabupaten Ponorogo, Jawa Timur 63471",
        "Eko Prasetio Widhi, M.Kom.",
        "Aktif",
        new Date(Date.parse("2026-01-01T00:00:00.000Z")),
      ],
      [
        "PSN-0018",
        "PP Al-Hikmah Malang",
        "Malang",
        "Jl. Raya Ketawang, Gondanglegi, Kabupaten Malang",
        "Ust. K.H. Mustofa Kamal",
        "Aktif",
        new Date(Date.parse("2026-01-01T00:00:01.000Z")),
      ],
    ],
  );

  // Akun inti (admin/validator + satu Pesantren per pesantren terdaftar) + sandi
  // awal prototipe. `USR-007` (UNIDA) selaras kartu login demo D-48.
  const passwordHash = await hashPassword(seedDefaultPassword);
  await insertRows(
    "users",
    ["id", "name", "email", "role", "institution_code", "status", "password_hash"],
    [
      ["USR-001", "Nadia Permata", "admin@ishas.demo", "admin", null, "Aktif", passwordHash],
      ["USR-002", "M. Ridwan", "validator@ishas.demo", "validator", null, "Aktif", passwordHash],
      [
        "USR-003",
        "Ust. K.H. Mustofa Kamal",
        "pesantren@ishas.demo",
        "pesantren",
        "PSN-0018",
        "Aktif",
        passwordHash,
      ],
      [
        "USR-007",
        "Eko Prasetio Widhi, M.Kom.",
        "unida@ishas.demo",
        "pesantren",
        "PSN-0024",
        "Aktif",
        passwordHash,
      ],
    ],
  );

  await insertRows("instrument_meta", ["id", "label", "checksum"], [
    [BANK_ID, liveInstrument.label, liveInstrument.checksum],
  ]);

  const dimRows: SqlValue[][] = [];
  const indRows: SqlValue[][] = [];
  const optRows: SqlValue[][] = [];
  liveInstrument.dimensions.forEach((dim, di) => {
    dimRows.push([dim.id, dim.name, dim.categoryId ?? null, json(dim.aspects), di + 1]);
    dim.indicators.forEach((ind, ii) => {
      indRows.push([
        ind.id,
        dim.id,
        ind.code,
        ind.title,
        ind.prompt,
        ind.answerType,
        ind.required,
        ind.evidenceRequired,
        ind.locationRequired,
        ind.weight,
        ind.categoryId ?? null,
        ind.aspectId ?? null,
        ii + 1,
      ]);
      ind.options.forEach((opt, oi) => {
        optRows.push([ind.id, opt.value, opt.label, opt.weight, opt.isFinding, oi + 1]);
      });
    });
  });
  await insertRows(
    "bank_dimensions",
    ["id", "name", "category_id", "aspects", "sort_order"],
    dimRows,
  );
  await insertRows(
    "bank_indicators",
    [
      "id",
      "dimension_id",
      "code",
      "title",
      "prompt",
      "answer_type",
      "is_required",
      "evidence_required",
      "location_required",
      "weight",
      "category_id",
      "aspect_id",
      "sort_order",
    ],
    indRows,
  );
  await insertRows(
    "bank_options",
    ["indicator_id", "value", "label", "weight", "is_finding", "sort_order"],
    optRows,
  );

  await insertRows("sequences", ["seq_name", "value"], [
    ["report", 1],
    ["institution", 19],
    ["assessment", 1],
    ["follow_up", 1],
  ]);
}
