import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../app/providers/AppProvider";
import { PageLayout } from "../../shared/ui/PageLayout";

export const DateEntryPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { settings, addDateEvent } = useAppContext();
  const enabledCategories = useMemo(() => settings.categories.filter((c) => c.enabled), [settings.categories]);
  const [memo, setMemo] = useState("");

  const [values, setValues] = useState<Record<string, { importance: number; satisfaction: number }>>(() => {
    return Object.fromEntries(enabledCategories.map((category) => [category.id, { importance: 5, satisfaction: 50 }]));
  });

  const onChange = (categoryId: string, key: "importance" | "satisfaction", value: number): void => {
    setValues((prev) => ({
      ...prev,
      [categoryId]: {
        ...(prev[categoryId] ?? { importance: 5, satisfaction: 50 }),
        [key]: value,
      },
    }));
  };

  const handleSave = async (): Promise<void> => {
    await addDateEvent({
      memo,
      scores: enabledCategories.map((category) => ({
        categoryId: category.id,
        importance: Math.max(1, Math.min(10, values[category.id]?.importance ?? 5)) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
        satisfaction: Math.max(1, Math.min(100, values[category.id]?.satisfaction ?? 50)),
      })),
    });

    navigate("/main");
  };

  return (
    <PageLayout title="点数入力">
      {enabledCategories.map((category) => (
        <div className="card" key={category.id}>
          <h3>{category.label}</h3>
          <label>
            重要度 (1-10)
            <input
              type="number"
              min={1}
              max={10}
              value={values[category.id]?.importance ?? 5}
              onChange={(e) => onChange(category.id, "importance", Number(e.target.value))}
            />
          </label>
          <label>
            満足度 (1-100)
            <input
              type="number"
              min={1}
              max={100}
              value={values[category.id]?.satisfaction ?? 50}
              onChange={(e) => onChange(category.id, "satisfaction", Number(e.target.value))}
            />
          </label>
        </div>
      ))}
      <label>
        メモ
        <textarea value={memo} onChange={(e) => setMemo(e.target.value)} />
      </label>
      <button onClick={handleSave}>保存</button>
    </PageLayout>
  );
};
