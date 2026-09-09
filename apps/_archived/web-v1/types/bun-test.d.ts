declare module 'bun:test' {
  type TestCallback = () => void | Promise<void>;

  export function beforeEach(callback: TestCallback): void;
  export function describe(name: string, callback: TestCallback): void;
  export function test(name: string, callback: TestCallback): void;

  export function expect<T>(value: T): {
    toBe(expected: unknown): void;
    toEqual(expected: unknown): void;
    toBeGreaterThan(expected: number): void;
  };
}
