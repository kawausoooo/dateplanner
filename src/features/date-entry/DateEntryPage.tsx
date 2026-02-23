import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../../app/providers/AppProvider";
import { PageLayout } from "../../shared/ui/PageLayout";

type EntryDraft = {
  date: string;
  memo: string;
  satisfactions: Record<string, number>;
};

const hasSelectedDate = (value: unknown): value is { date: string } => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as { date?: unknown };
  return typeof candidate.date === "string";
};

export const DateEntryPage = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useAppContext();
  const enabledCategories = useMemo(() => settings.categories.filter((c) => c.enabled), [settings.categories]);
  const [memo, setMemo] = useState("");

  // 入力中は string で保持することで、空欄や途中入力を許容する
  const [satisfactions, setSatisfactions] = useState<Record<string, string>>(() => {
    return Object.fromEntries(enabledCategories.map((category) => [category.id, "50"]));
  });

  const onChangeSatisfaction = (categoryId: string, raw: string): void => {
    // 空欄は許容し、100 超は即座に上限値へ丸める
    const value = raw !== "" && Number(raw) > 100 ? "100" : raw;
    setSatisfactions((prev) => ({ ...prev, [categoryId]: value }));
  };

  const handleOk = (): void => {
    if (!selectedDate) {
      navigate("/entry", { replace: true });
      return;
    }

    // 保存時のみ数値に変換・クランプ（空欄は 1 扱い）
    const numericSatisfactions = Object.fromEntries(
      Object.entries(satisfactions).map(([id, raw]) => [
        id,
        Math.max(1, Math.min(100, Number(raw) || 1)),
      ]),
    );

    const draft: EntryDraft = {
      date: selectedDate,
      memo,
      satisfactions: numericSatisfactions,
    };

    navigate("/entry/importance", { state: draft });
  };

  const selectedDate = hasSelectedDate(location.state) ? location.state.date : null;

  if (!selectedDate) {
    return (
      <PageLayout title="満足度入力">
        <div className="card">
          <p>先にカレンダーから日付を選択してください。</p>
        </div>
        <button onClick={() => navigate("/entry", { replace: true })}>日付選択に戻る</button>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="満足度入力">
      <div className="card">
        <p>選択日: {selectedDate}</p>
      </div>
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
              onChange={(e) => onChangeSatisfaction(category.id, e.target.value)}
            />
          </label>
        </div>
      ))}
      <label>
        メモ
        <textarea value={memo} onChange={(e) => setMemo(e.target.value)} />
      </label>
      <div className="button-row">
        <button onClick={() => navigate("/entry")}>日付を選び直す</button>
        <button onClick={handleOk}>OK</button>
      </div>
    </PageLayout>
  );
};
