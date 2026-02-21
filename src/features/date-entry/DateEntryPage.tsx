import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../app/providers/AppProvider";
import { PageLayout } from "../../shared/ui/PageLayout";

type EntryDraft = {
  memo: string;
  satisfactions: Record<string, number>;
};

export const DateEntryPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { settings } = useAppContext();
  const enabledCategories = useMemo(() => settings.categories.filter((c) => c.enabled), [settings.categories]);
  const [memo, setMemo] = useState("");

  const [satisfactions, setSatisfactions] = useState<Record<string, number>>(() => {
    return Object.fromEntries(enabledCategories.map((category) => [category.id, 50]));
  });

  const onChangeSatisfaction = (categoryId: string, value: number): void => {
    setSatisfactions((prev) => ({
      ...prev,
      [categoryId]: value,
    }));
  };

  const handleOk = (): void => {
    const draft: EntryDraft = {
      memo,
      satisfactions,
    };

    navigate("/entry/importance", { state: draft });
  };

  return (
    <PageLayout title="満足度入力">
      {enabledCategories.map((category) => (
        <div className="card" key={category.id}>
          <h3>{category.label}</h3>
          <label>
            満足度 (1-100)
            <input
              type="number"
              min={1}
              max={100}
              value={satisfactions[category.id] ?? 50}
              onChange={(e) => onChangeSatisfaction(category.id, Number(e.target.value))}
            />
          </label>
        </div>
      ))}
      <label>
        メモ
        <textarea value={memo} onChange={(e) => setMemo(e.target.value)} />
      </label>
      <button onClick={handleOk}>OK</button>
    </PageLayout>
  );
};
