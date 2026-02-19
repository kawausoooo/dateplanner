import { useMemo, useState } from "react";
import { useAppContext } from "../../app/providers/AppProvider";
import { PageLayout } from "../../shared/ui/PageLayout";

export const SettingsPage = (): JSX.Element => {
  const { settings, updateSettings } = useAppContext();
  const [draft, setDraft] = useState(settings);

  const enabledCategories = useMemo(
    () => draft.categories.filter((category) => category.enabled),
    [draft.categories],
  );

  const toggleCategory = (id: string): void => {
    setDraft((prev) => ({
      ...prev,
      categories: prev.categories.map((category) =>
        category.id === id ? { ...category, enabled: !category.enabled } : category,
      ),
    }));
  };

  const setRadarSlot = (index: number, categoryId: string): void => {
    setDraft((prev) => {
      const next = [...prev.selectedRadarCategoryIds] as typeof prev.selectedRadarCategoryIds;
      next[index] = categoryId;
      return { ...prev, selectedRadarCategoryIds: next };
    });
  };

  const save = async (): Promise<void> => {
    await updateSettings(draft);
  };

  return (
    <PageLayout title="設定">
      <div className="card">
        <h3>評価項目</h3>
        {draft.categories.map((category) => (
          <label key={category.id}>
            <input
              type="checkbox"
              checked={category.enabled}
              onChange={() => toggleCategory(category.id)}
            />
            {category.label}
          </label>
        ))}
      </div>

      <div className="card">
        <h3>5角形に表示する5項目</h3>
        {[0, 1, 2, 3, 4].map((index) => (
          <label key={index}>
            枠{index + 1}
            <select
              value={draft.selectedRadarCategoryIds[index]}
              onChange={(e) => setRadarSlot(index, e.target.value)}
            >
              {enabledCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="card">
        <h3>保存先</h3>
        <label>
          <input
            type="radio"
            checked={draft.storageMode === "local"}
            onChange={() => setDraft((prev) => ({ ...prev, storageMode: "local" }))}
          />
          localStorage
        </label>
        <label>
          <input
            type="radio"
            checked={draft.storageMode === "remote"}
            onChange={() => setDraft((prev) => ({ ...prev, storageMode: "remote" }))}
          />
          Firebase(将来)
        </label>
      </div>

      <button onClick={save}>設定を保存</button>
    </PageLayout>
  );
};
