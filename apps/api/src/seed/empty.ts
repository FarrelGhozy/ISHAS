// Seed kosong (production): struktur valid tapi tanpa data demo.
// Lihat BACKEND_DATA_MODEL §10 (mode empty).

import { K3_CATEGORIES } from "../../../web/mocks/kategori-k3";
import { hitungChecksumInstrument, type ChecksumDimension } from "../checksum";
import { insertRows, json, truncateAll } from "./helpers";

const BANK_ID = "INS-LIVE";
const BANK_LABEL = "Bank Instrumen Live";

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

  await insertRows(
    "users",
    ["id", "name", "email", "role", "institution_code", "status"],
    [["USR-001", "Super Admin", "admin@ishas.demo", "admin", null, "Aktif"]],
  );

  const dimensions: ChecksumDimension[] = [
    {
      id: "DIM-001",
      indicators: [
        {
          id: "IND-K3L-001",
          answerType: "ya-tidak",
          weight: 1,
          required: true,
          evidenceRequired: false,
          locationRequired: false,
          options: [
            { value: "Ya", weight: 100, isFinding: false },
            { value: "Tidak", weight: 20, isFinding: true },
          ],
        },
      ],
    },
  ];
  const checksum = hitungChecksumInstrument(dimensions);

  await insertRows("instrument_meta", ["id", "label", "checksum"], [
    [BANK_ID, BANK_LABEL, checksum],
  ]);
  await insertRows(
    "bank_dimensions",
    ["id", "name", "category_id", "aspects", "sort_order"],
    [["DIM-001", "Keselamatan", "KAT-KESELAMATAN", json([]), 1]],
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
    [
      [
        "IND-K3L-001",
        "DIM-001",
        "K3L-001",
        "Instalasi listrik aman",
        "Apakah instalasi listrik dalam kondisi aman?",
        "ya-tidak",
        true,
        false,
        false,
        1,
        "KAT-KESELAMATAN",
        "ASP-KES-001",
        1,
      ],
    ],
  );
  await insertRows(
    "bank_options",
    ["indicator_id", "value", "label", "weight", "is_finding", "sort_order"],
    [
      ["IND-K3L-001", "Ya", "Ya", 100, false, 1],
      ["IND-K3L-001", "Tidak", "Tidak", 20, true, 2],
    ],
  );

  await insertRows("sequences", ["seq_name", "value"], [
    ["report", 1],
    ["institution", 1],
    ["assessment", 1],
    ["follow_up", 1],
  ]);
}
