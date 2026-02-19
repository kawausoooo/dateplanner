export type Importance = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface ScoreCategory {
  id: string;
  label: string;
  enabled: boolean;
}

export interface DateScoreInput {
  categoryId: string;
  importance: Importance;
  satisfaction: number; // 1..100
}

export interface DateEvent {
  id: string;
  personId: string;
  date: string;
  scores: DateScoreInput[];
  memo?: string;
}
