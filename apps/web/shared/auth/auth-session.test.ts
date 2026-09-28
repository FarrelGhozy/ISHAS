// Uji store akun server Fase 6 (tanpa React): cache sesi di sessionStorage.
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { getServerAccount, setServerAccount, type ServerAccount } from "./auth-session";

const store = new Map<string, string>();
const descriptor = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");

beforeEach(() => {
  store.clear();
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    },
  });
  setServerAccount(null);
});

afterEach(() => {
  if (descriptor) Object.defineProperty(globalThis, "sessionStorage", descriptor);
  else Reflect.deleteProperty(globalThis, "sessionStorage");
});

const account: ServerAccount = {
  id: "USR-003",
  name: "Ust. K. H. Mustofa Kamal",
  email: "pesantren@ishas.demo",
  roleId: "pesantren",
  role: "Pesantren",
  status: "Aktif",
  institutionCodes: ["PSN-0018"],
};

describe("auth-session", () => {
  test("set akun menyimpan cache", () => {
    setServerAccount(account);
    expect(getServerAccount()).toEqual(account);
  });

  test("akun null menghapus cache", () => {
    setServerAccount(account);
    setServerAccount(null);
    expect(getServerAccount()).toBeNull();
    expect(store.size).toBe(0);
  });
});
