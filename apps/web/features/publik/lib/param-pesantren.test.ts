import { describe, expect, test } from "bun:test";
import { paramPesantrenTidakSah, pilihInstitusiAwal } from "./param-pesantren";

describe("pilihInstitusiAwal", () => {
  test("param URL dipakai apa adanya walau daftar belum termuat (muat dingin)", () => {
    expect(
      pilihInstitusiAwal({ param: "PSN-0019", registeredCodes: [] }),
    ).toBe("PSN-0019");
  });

  test("param menang atas kode akun dan ingatan", () => {
    expect(
      pilihInstitusiAwal({
        param: "PSN-0019",
        kodeAkun: "PSN-0018",
        ingatan: "PSN-0018",
        registeredCodes: ["PSN-0018", "PSN-0019"],
      }),
    ).toBe("PSN-0019");
  });

  test("tanpa param: pakai kode akun Pesantren", () => {
    expect(
      pilihInstitusiAwal({ param: null, kodeAkun: "PSN-0018", registeredCodes: ["PSN-0018"] }),
    ).toBe("PSN-0018");
  });

  test("tanpa param/akun: ingatan dipakai hanya bila masih terdaftar", () => {
    expect(
      pilihInstitusiAwal({ param: null, ingatan: "PSN-0019", registeredCodes: ["PSN-0018"] }),
    ).toBe("");
    expect(
      pilihInstitusiAwal({
        param: null,
        ingatan: "PSN-0019",
        registeredCodes: ["PSN-0018", "PSN-0019"],
      }),
    ).toBe("PSN-0019");
  });
});

describe("paramPesantrenTidakSah", () => {
  test("null atau kode sah → false", () => {
    expect(paramPesantrenTidakSah(null, ["PSN-0018"])).toBe(false);
    expect(paramPesantrenTidakSah("PSN-0018", ["PSN-0018"])).toBe(false);
  });

  test("daftar belum termuat → ditahan (false), bukan pesan dini", () => {
    expect(paramPesantrenTidakSah("PSN-0000", [])).toBe(false);
  });

  test("kode tak dikenal setelah daftar termuat → true", () => {
    expect(paramPesantrenTidakSah("PSN-0000", ["PSN-0018"])).toBe(true);
  });
});
