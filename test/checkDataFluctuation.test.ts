import { expect, test } from 'vitest'
import { checkDataFluctuation } from '../src/index'

test("检查数据波动", () => {
  // 非4的倍数 无波动
  expect(checkDataFluctuation([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBe(-1);
  // 4的倍数 有波动
  const data2 = [
    1, 2, 3, 4,
    5, 6, 7, 8,
    9, 13, 14, 15,
    16, 17, 18, 19
  ];
  expect(checkDataFluctuation(data2)).toBe(8);

  // 其他情况
  expect(checkDataFluctuation([
    50, 60, 60,
    50, 60, 70,
    60, 70, 60,
    50, 60
  ])).toBe(-1)

  //其他情况2
  expect(checkDataFluctuation([
    80, 80, 40,
    40, 40, 40,
    40, 60, 60,
    60, 60, 60
  ])).toBe(0)

  // 波动在两个四分位数之间
  const fluctuationBetweenChunks = [
    1, 2, 3, 4, 5,
    6, 7, 8, 9, 10,
    14, 15, 16, 17, 18,
    19, 20, 21, 22, 23,
  ];
  expect(checkDataFluctuation(fluctuationBetweenChunks)).toBe(9);

  // 超大数据量
  const data3 = Array.from({ length: 1234567 }, (_, i) => i);
  //制造较大的波动
  data3[500] = 0.1;
  expect(checkDataFluctuation(data3)).toBe(500);
});