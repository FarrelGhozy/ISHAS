// Vektor uji checksum bank (BACKEND_MIGRATION.md §5.a): port backend wajib
// menghasilkan nilai identik dengan mock dan dengan checksum seed.
import { describe, expect, test } from "bun:test";
import { hitungChecksumInstrument as backend } from "../src/checksum";
import { hitungChecksumInstrument as mock } from "../../web/mocks/instrument-bank";
import { SEED } from "../../web/mocks/seed/seed";

describe("vektor checksum bank", () => {
  test("backend = mock = checksum bank seed", () => {
    const dims = SEED.instrument.dimensions;
    const fromBackend = backend(dims);
    const fromMock = mock(dims);
    expect(fromBackend).toBe(fromMock);
    expect(fromBackend).toBe(SEED.instrument.checksum);
  });
});
