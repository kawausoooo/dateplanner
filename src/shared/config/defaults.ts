import type { AppSettings } from "../../entities/settings";
import type { ScoreCategory } from "../../entities/score";

export const DEFAULT_CATEGORIES: ScoreCategory[] = [
  // --- 既存の5項目 ---
  { id: "conversation", label: "会話",     enabled: true },
  { id: "fun",          label: "楽しさ",   enabled: true },
  { id: "comfort",      label: "居心地",   enabled: true },
  { id: "kindness",     label: "優しさ",   enabled: true },
  { id: "future",       label: "将来性",   enabled: true },
  // --- 新規追加10項目 ---
  { id: "excitement",   label: "ドキドキ感", enabled: true },
  { id: "food",         label: "食事",     enabled: true },
  { id: "appearance",   label: "見た目",   enabled: true },
  { id: "laughter",     label: "笑い",     enabled: true },
  { id: "sensitivity",  label: "気遣い",   enabled: true },
  { id: "style",        label: "センス",   enabled: true },
  { id: "chemistry",    label: "相性",     enabled: true },
  { id: "planning",     label: "プラン力", enabled: true },
  { id: "affection",    label: "スキンシップ", enabled: true },
  { id: "again",        label: "また会いたい度", enabled: true },
];

export const DEFAULT_SETTINGS: AppSettings = {
  categories: DEFAULT_CATEGORIES,
  selectedRadarCategoryIds: ["conversation", "fun", "comfort", "kindness", "future"],
  storageMode: "local",
};
