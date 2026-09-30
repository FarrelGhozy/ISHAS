// Render aman halaman /login (SSR awal: metode login belum termuat).
import { expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { LoginPage } from "./login-page";

test("LoginPage render tanpa error + menampilkan tautan dashboard publik", () => {
  const html = renderToString(
    <MemoryRouter initialEntries={["/login"]}>
      <LoginPage />
    </MemoryRouter>,
  );
  expect(html).toContain("Masuk");
  expect(html).toContain("Dashboard publik");
});
