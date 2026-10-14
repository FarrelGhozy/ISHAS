// Test render checkbox tanggung jawab D-50 pada form lapor-cepat.

import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { LaporForm } from "./lapor-form";
import { EMPTY_LAPOR_VALUES } from "../lib/lapor-validation";

const noop = () => {};

function render(setuju: boolean, setujuError: string | null): string {
  return renderToString(
    <LaporForm
      evidencePicker={null}
      values={EMPTY_LAPOR_VALUES}
      errors={{}}
      registered={[]}
      areas={[]}
      areasEmpty={false}
      categories={[]}
      aspects={[]}
      readOnly={false}
      submitting={false}
      submitDisabled
      confirmCancel={false}
      isPrefilledManager={false}
      formError={null}
      setuju={setuju}
      setujuError={setujuError}
      onSetuju={noop}
      onChange={noop}
      onBlur={noop}
      onSubmit={noop}
      onCancel={noop}
      onConfirmCancel={noop}
      onKeepEditing={noop}
      registerField={noop}
    />,
  );
}

describe("checkbox tanggung jawab D-50", () => {
  test("label + checkbox tampil dan belum centang", () => {
    const html = render(false, null);
    expect(html).toContain("Saya bertanggung jawab atas kebenaran laporan ini.");
    expect(html).toContain('type="checkbox"');
    expect(html).not.toContain("checked");
  });

  test("error inline tampil bila belum centang saat kirim", () => {
    const html = render(false, "Centang pernyataan tanggung jawab untuk mengirim.");
    expect(html).toContain("Centang pernyataan tanggung jawab untuk mengirim.");
  });

  test("sudah centang → checkbox checked", () => {
    expect(render(true, null)).toContain("checked");
  });
});
