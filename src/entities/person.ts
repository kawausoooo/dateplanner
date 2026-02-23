export type PersonImportance = "high" | "medium" | "low";

export interface Person {
  id: string;
  icon: string;
  name: string;
  importance: PersonImportance;
  createdAt: string;
}
