// Uji sumber state backend (D-31): tanpa fallback mock, status + error jelas,
// refresh memulihkan setelah gagal, dan request ganda tidak dobel.
import { afterEach, describe, expect, test } from "bun:test";
import { createBackendState, emptyIshasState } from "./backend-state";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function stubFetch(payload: unknown, status = 200): { count: () => number } {
  let n = 0;
  globalThis.fetch = (async () => {
    n += 1;
    return new Response(JSON.stringify(payload), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }) as unknown as typeof fetch;
  return { count: () => n };
}

async function settle(): Promise<void> {
  await Bun.sleep(0);
  await Bun.sleep(0);
}

describe("emptyIshasState", () => {
  test("semua koleksi kosong dan instrument tanpa dimensi", () => {
    const state = emptyIshasState();
    expect(state.schemaVersion).toBe(15);
    expect(state.institutions).toEqual([]);
    expect(state.reports).toEqual([]);
    expect(state.notifications).toEqual([]);
    expect(state.instrument.dimensions).toEqual([]);
    expect(state.counters).toEqual({ report: 0, institution: 0 });
  });
});

describe("createBackendState", () => {
  test("sukses: idle → loading → ready + data server", async () => {
    const payload = emptyIshasState();
    stubFetch({ ok: true, data: payload });
    const store = createBackendState("/public/state");
    expect(store.getSnapshot().status).toBe("idle");
    expect(store.getSnapshot().state).toBeNull();
    store.refresh();
    await settle();
    const snapshot = store.getSnapshot();
    expect(snapshot.status).toBe("ready");
    expect(snapshot.error).toBeNull();
    expect(snapshot.state).toEqual(payload);
  });

  test("gagal: state null + error, lalu refresh memulihkan", async () => {
    stubFetch({ ok: false, error: "Server mati." }, 500);
    const store = createBackendState("/admin/state");
    store.refresh();
    await settle();
    expect(store.getSnapshot().status).toBe("error");
    expect(store.getSnapshot().state).toBeNull();
    expect(store.getSnapshot().error).toBe("Server mati.");

    const payload = emptyIshasState();
    stubFetch({ ok: true, data: payload });
    store.refresh();
    await settle();
    expect(store.getSnapshot().status).toBe("ready");
    expect(store.getSnapshot().state).toEqual(payload);
  });

  test("refresh ganda saat berjalan hanya memanggil sekali", async () => {
    const spy = stubFetch({ ok: true, data: emptyIshasState() });
    const store = createBackendState("/validator/state");
    store.refresh();
    store.refresh();
    await settle();
    expect(spy.count()).toBe(1);
  });
});
