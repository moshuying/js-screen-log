import { expect, test } from 'vitest'

function fibonacci(n: number): number {
  if (n < 2) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}
test("Force Engine init data", () => {
  expect(fibonacci(10)).toBe(55);
});