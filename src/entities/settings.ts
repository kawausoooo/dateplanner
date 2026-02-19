import type { ScoreCategory } from "./score";

export type StorageMode = "local" | "remote";

export interface AppSettings {
  categories: ScoreCategory[];
  selectedRadarCategoryIds: [string, string, string, string, string];
  storageMode: StorageMode;
}
