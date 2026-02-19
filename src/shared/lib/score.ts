import type { AggregateResult } from "../../entities/aggregate";
import type { DateEvent } from "../../entities/score";

const round2 = (value: number): number => Math.round(value * 100) / 100;

export const calculateWeightedAverage = (
  scores: Array<{ importance: number; satisfaction: number }>,
): number => {
  let weightSum = 0;
  let weightedScoreSum = 0;

  for (const score of scores) {
    weightSum += score.importance;
    weightedScoreSum += score.importance * score.satisfaction;
  }

  if (weightSum === 0) {
    return 0;
  }

  return round2(weightedScoreSum / weightSum);
};

export const calculateAggregate = (events: DateEvent[]): AggregateResult => {
  const allScores = events.flatMap((event) => event.scores);
  const overall = calculateWeightedAverage(allScores);

  const byCategory: Record<string, Array<{ importance: number; satisfaction: number }>> = {};
  for (const score of allScores) {
    byCategory[score.categoryId] ??= [];
    byCategory[score.categoryId].push(score);
  }

  const categoryAverage: Record<string, number> = {};
  for (const [categoryId, categoryScores] of Object.entries(byCategory)) {
    categoryAverage[categoryId] = calculateWeightedAverage(categoryScores);
  }

  return {
    overall,
    byCategory: categoryAverage,
    updatedAt: new Date().toISOString(),
  };
};
