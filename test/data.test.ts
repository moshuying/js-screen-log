import { expect, test } from 'vitest'
import { checkDataFluctuation } from '../src/index'

test("检查数据波动", () => {
  // 无波动
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  expect(checkDataFluctuation(data)).toBe(-1);
  // 有波动
  const data2 = [1, 2, 3, 4, 5, 6, 12, 13, 14, 15];
  expect(checkDataFluctuation(data2)).toBe(5);
});