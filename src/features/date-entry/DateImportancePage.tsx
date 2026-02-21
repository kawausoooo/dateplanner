import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../../app/providers/AppProvider";
import type { Importance } from "../../entities/score";
import { PageLayout } from "../../shared/ui/PageLayout";

type EntryDraft = {
  memo: string;
  satisfactions: Record<string, number>;
};

const isEntryDraft = (value: unknown): value is EntryDraft => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<EntryDraft>;
  return typeof candidate.memo === "string" && typeof candidate.satisfactions === "object" && candidate.satisfactions !== null;
};

export const DateImportancePage = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, addDateEvent } = useAppContext();
  const enabledCategories = useMemo(() => settings.categories.filter((c) => c.enabled), [settings.categories]);
  const [importance, setImportance] = useState<number>(5);

  const draft = isEntryDraft(location.state) ? location.state : null;

  const handleSave = async (): Promise<void> => {
    if (!draft) {
      navigate("/entry", { replace: true });
      return;
    }

    await addDateEvent({
      memo: draft.memo,
      scores: enabledCategories.map((category) => ({
        categoryId: category.id,
        importance: Math.max(1, Math.min(10, importance)) as Importance,
        satisfaction: Math.max(1, Math.min(100, draft.satisfactions[category.id] ?? 50)),
      })),
    });

    navigate("/");
  };

  if (!draft) {
    return (
      <PageLayout title="デート重要度入力">
        <div className="card">
          <p>先に満足度を入力してください。</p>
        </div>
        <button onClick={() => navigate("/entry", { replace: true })}>満足度入力に戻る</button>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="デート重要度入力">
      <div className="card">
        <p>このデート全体の重要度を入力してください。</p>
        <label>
          重要度 (1-10)
          <input
            type="number"
            min={1}
            max={10}
            value={importance}
            onChange={(e) => setImportance(Number(e.target.value))}
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
