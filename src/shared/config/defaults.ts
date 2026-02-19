import type { AppSettings } from "../../entities/settings";
import type { ScoreCategory } from "../../entities/score";

export const DEFAULT_CATEGORIES: ScoreCategory[] = [
  { id: "conversation", label: "会話", enabled: true },
  { id: "fun", label: "楽しさ", enabled: true },
  { id: "comfort", label: "居心地", enabled: true },
  { id: "kindness", label: "優しさ", enabled: true },
  { id: "future", label: "将来性", enabled: true },
];

export const DEFAULT_SETTINGS: AppSettings = {
  categories: DEFAULT_CATEGORIES,
  selectedRadarCategoryIds: ["conversation", "fun", "comfort", "kindness", "future"],
  storageMode: "local",
};
