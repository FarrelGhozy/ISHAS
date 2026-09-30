// Menentukan tampilan `/login`: kartu demo (satu klik) atau form email+sandi.
// Mode mock selalu demo (tidak ada auth sandi); mode backend mengikuti metode
// yang disediakan server (`/auth/methods`). Fallback aman = form sandi.

export type LoginMode = "demo" | "password";

export function resolveLoginMode(
  useBackend: boolean,
  methods: { demo: boolean } | null,
): LoginMode {
  if (!useBackend) return "demo";
  if (!methods) return "password";
  return methods.demo ? "demo" : "password";
}
