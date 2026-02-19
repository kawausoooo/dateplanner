import { describe, expect, it } from "vitest";
import { calculateAggregate, calculateWeightedAverage } from "../score";
import type { DateEvent } from "../../../entities/score";

describe("calculateWeightedAverage", () => {
  it("returns weighted average across scores", () => {
    const result = calculateWeightedAverage([
      { importance: 10, satisfaction: 90 },
      { importance: 5, satisfaction: 50 },
    ]);

    expect(result).toBe(76.67);
  });

  it("returns 0 when weight sum is zero", () => {
    const result = calculateWeightedAverage([
      { importance: 0, satisfaction: 80 },
      { importance: 0, satisfaction: 20 },
    ]);

    expect(result).toBe(0);
  });

  it("handles boundary values", () => {
    const result = calculateWeightedAverage([
      { importance: 1, satisfaction: 1 },
      { importance: 10, satisfaction: 100 },
    ]);

    expect(result).toBe(91);
  });
});

describe("calculateAggregate", () => {
  it("aggregates overall and category scores", () => {
    const events: DateEvent[] = [
      {
        id: "e1",
        personId: "p1",
        date: "2026-02-19",
        scores: [
          { categoryId: "conversation", importance: 10, satisfaction: 90 },
          { categoryId: "fun", importance: 5, satisfaction: 70 },
        ],
      },
      {
        id: "e2",
        personId: "p1",
        date: "2026-02-20",
        scores: [{ categoryId: "conversation", importance: 2, satisfaction: 60 }],
      },
    ];

    const result = calculateAggregate(events);

    expect(result.overall).toBe(80.59);
    expect(result.byCategory.conversation).toBe(85);
    expect(result.byCategory.fun).toBe(70);
  });
});
