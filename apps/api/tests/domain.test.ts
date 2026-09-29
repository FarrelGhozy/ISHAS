// Uji unit domain Fase 1 memakai SEED mock (murni, tanpa DB).
import { describe, expect, test } from "bun:test";
import { SEED } from "../../web/mocks/seed/seed";
import { buildPublicState } from "../src/domain/public-state";
import { getDraft } from "../src/domain/self-assessment";
import { validateLapor } from "../src/domain/lapor";
import { httpStatusForError, paginate } from "../src/http";
import { imageInfo } from "../src/image";

const registered = SEED.institutions.find((i) => i.code === "PSN-0018")!;
const area = SEED.areas.find((a) => a.institutionCode === "PSN-0018")!;

const baseInput = {
  institutionCode: registered.code,
  reporterName: "Ahmad",
  title: "Kabel terkelupas di dapur",
  description: "Kabel dekat kompor terkelupas dan berisiko tersengat.",
  areaId: area.id,
};

describe("validateLapor", () => {
  test("input sah → null", () => {
    expect(validateLapor(SEED, baseInput, null)).toBeNull();
  });

  test("nama < 2 → pesan mock", () => {
    expect(validateLapor(SEED, { ...baseInput, reporterName: "A" }, null)).toBe(
      "Nama minimal 2 karakter.",
    );
  });

  test("judul < 10 → pesan mock", () => {
    expect(validateLapor(SEED, { ...baseInput, title: "pendek" }, null)).toBe(
      "Judul minimal 10 karakter.",
    );
  });

  test("deskripsi < 20 → pesan mock", () => {
    expect(validateLapor(SEED, { ...baseInput, description: "pendek" }, null)).toBe(
      "Deskripsi minimal 20 karakter.",
    );
  });

  test("pesantren tak terdaftar → pesan mock", () => {
    expect(validateLapor(SEED, { ...baseInput, institutionCode: "PSN-9999" }, null)).toBe(
      "Pesantren tidak tersedia untuk pelaporan.",
    );
  });

  test("tanpa area/manual → pesan mock", () => {
    expect(validateLapor(SEED, { ...baseInput, areaId: undefined }, null)).toBe(
      "Pilih area atau tulis lokasi secara manual.",
    );
  });

  test("usulan rekomendasi < 10 → pesan mock", () => {
    expect(validateLapor(SEED, { ...baseInput, reporterRecommendation: "pendek" }, null)).toBe(
      "Usulan rekomendasi minimal 10 karakter.",
    );
  });

  test("bukti tidak sah diteruskan dari adapter", () => {
    expect(validateLapor(SEED, baseInput, "Lampiran bukti tidak sah. Pilih gambar kembali.")).toBe(
      "Lampiran bukti tidak sah. Pilih gambar kembali.",
    );
  });
});

describe("buildPublicState (invarian D-02)", () => {
  const publicState = buildPublicState(SEED);

  test("hanya laporan Diterima yang tampil", () => {
    expect(publicState.reports.length).toBeGreaterThan(0);
    expect(publicState.reports.every((r) => r.validationStatus === "Diterima")).toBe(true);
    expect(publicState.reports.length).toBeLessThan(SEED.reports.length);
  });

  test("identitas pelapor + bukti privat disingkirkan", () => {
    for (const report of publicState.reports) {
      expect(report.reporterName).toBe("");
      expect(report.reporterAccountEmail).toBeUndefined();
      expect(report.reporterRecommendation).toBeUndefined();
      expect(report.evidenceAssetId).toBeUndefined();
      expect(report.rejectionReason).toBeUndefined();
    }
  });

  test("jawaban mentah snapshot dikosongkan", () => {
    expect(publicState.selfAssessmentSnapshots.length).toBeGreaterThan(0);
    for (const snapshot of publicState.selfAssessmentSnapshots) {
      expect(Object.keys(snapshot.answers)).toHaveLength(0);
    }
  });

  test("audit + notifikasi + SAM tidak ikut publik", () => {
    expect(publicState.auditEvents).toHaveLength(0);
    expect(publicState.notifications).toHaveLength(0);
    expect(publicState.samAssessments).toHaveLength(0);
  });

  test("draft penilaian tidak ikut publik (D-31)", () => {
    expect(Object.keys(publicState.selfAssessmentDrafts)).toHaveLength(0);
  });
});

describe("getDraft (D-31)", () => {
  const draftId = Object.keys(SEED.selfAssessmentDrafts)[0]!;

  test("draft ada → dikembalikan", () => {
    const result = getDraft(SEED, draftId);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.draft.id).toBe(draftId);
  });

  test("draft tidak ada → error", () => {
    const result = getDraft(SEED, "SELF-TIDAK-ADA");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Draft tidak ditemukan.");
  });
});

describe("httpStatusForError", () => {
  test("not found → 404", () => {
    expect(httpStatusForError("Laporan tidak ditemukan.")).toBe(404);
  });
  test("peran/scope → 403", () => {
    expect(
      httpStatusForError("Hanya publik tanpa login dan Pesantren aktif yang dapat mengirim laporan."),
    ).toBe(403);
  });
  test("konflik → 409", () => {
    expect(httpStatusForError("Instrumen berubah saat Anda mengisi. Buang draft lama.")).toBe(409);
    expect(
      httpStatusForError("Denah aktif berubah. Muat ulang dan periksa versi terbaru."),
    ).toBe(409);
  });
  test("validasi umum → 400", () => {
    expect(httpStatusForError("Judul minimal 10 karakter.")).toBe(400);
  });
});

describe("paginate", () => {
  test("default + batas maks 100", () => {
    const result = paginate([1, 2, 3, 4, 5], new URL("http://x/?limit=2"));
    expect(result.items).toEqual([1, 2]);
    expect(result.total).toBe(5);
  });
});

describe("imageInfo", () => {
  test("PNG membaca lebar/tinggi", () => {
    const png = new Uint8Array(24);
    png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    png[16] = 0;
    png[17] = 0;
    png[18] = 0x03;
    png[19] = 0x20; // 800
    png[20] = 0;
    png[21] = 0;
    png[22] = 0x02;
    png[23] = 0x1c; // 540
    expect(imageInfo(png)).toEqual({ kind: "png", width: 800, height: 540 });
  });

  test("bukan gambar → null", () => {
    expect(imageInfo(new Uint8Array([1, 2, 3, 4]))).toBeNull();
  });
});
