import { sum } from "../sum";

test("Positive Values Gives Positive ", () => {
  expect(sum(1, 2)).toBe(3);
});

test("Negative Values Gives Negative", () => {
  expect(sum(-4, -4)).toBe(-8);
});

test("Opposite Values Gives Zero", () => {
  expect(sum(-4, 4)).toBe(0);
});
