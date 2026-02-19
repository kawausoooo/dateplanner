export interface AggregateResult {
  overall: number;
  byCategory: Record<string, number>;
  updatedAt: string;
}
