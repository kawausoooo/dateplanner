import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../../app/providers/AppProvider";
import type { Importance } from "../../entities/score";
import { PageLayout } from "../../shared/ui/PageLayout";

type EntryDraft = {
  date: string;
  memo: string;
  satisfactions: Record<string, number>;
};

const isEntryDraft = (value: unknown): value is EntryDraft => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<EntryDraft>;
  return (
    typeof candidate.date === "string"
    && typeof candidate.memo === "string"
    && typeof candidate.satisfactions === "object"
    && candidate.satisfactions !== null
  );
};

export const DateImportancePage = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, addDateEvent } = useAppContext();
  const enabledCategories = useMemo(() => settings.categories.filter((c) => c.enabled), [settings.categories]);
  // 入力中は string で保持することで、空欄や途中入力を許容する
  const [importance, setImportance] = useState<string>("5");

  const draft = isEntryDraft(location.state) ? location.state : null;

  const handleSave = async (): Promise<void> => {
    if (!draft) {
      navigate("/entry", { replace: true });
      return;
    }

    await addDateEvent({
      date: draft.date,
      memo: draft.memo,
      scores: enabledCategories.map((category) => ({
        categoryId: category.id,
        importance: Math.max(1, Math.min(10, Number(importance) || 1)) as Importance,
        satisfaction: Math.max(1, Math.min(100, draft.satisfactions[category.id] ?? 50)),
      })),
    });

    navigate("/");
  };

  if (!draft) {
    return (
      <PageLayout title="デート重要度入力">
        <div className="card">
          <p>先に日付と満足度を入力してください。</p>
        </div>
        <button onClick={() => navigate("/entry", { replace: true })}>日付選択に戻る</button>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="デート重要度入力">
      <div className="card">
        <p>選択日: {draft.date}</p>
        <p>このデートの重要度を入力してください。</p>
        <label>
          重要度 (1-10)
          <input
            type="number"
            min={1}
            max={10}
            value={importance ?? ""}
            onChange={(e) => {
              // 空欄は許容し、10 超は即座に上限値へ丸める
              const raw = e.target.value;
              setImportance(raw !== "" && Number(raw) > 10 ? "10" : raw);
            }}
          />
        </label>
      </div>
      <div className="button-row">
        <button onClick={() => navigate(-1)}>戻る</button>
        <button onClick={() => void handleSave()}>保存</button>
      </div>
    </PageLayout>
  );
};
