import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../app/providers/AppProvider";
import type { PersonImportance } from "../../entities/person";
import { PageLayout } from "../../shared/ui/PageLayout";

const DEFAULT_ICON = "🙂";
const ICON_OPTIONS = ["🙂", "😄", "🧑", "👩", "👨", "🌟"] as const;

const importanceOrder: Record<PersonImportance, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const importanceLabel: Record<PersonImportance, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

const sortByImportanceAndName = <T extends { importance: PersonImportance; name: string }>(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    const byImportance = importanceOrder[b.importance] - importanceOrder[a.importance];
    if (byImportance !== 0) {
      return byImportance;
    }

    return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
  });
};

export const PersonSelectorPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { persons, selectedPersonId, addPerson, updatePerson, deletePerson, selectPerson } = useAppContext();

  const [name, setName] = useState("");
  const [importance, setImportance] = useState<PersonImportance>("medium");
  const [presetIcon, setPresetIcon] = useState(DEFAULT_ICON);
  const [customIcon, setCustomIcon] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);

  const sortedPersons = useMemo(() => sortByImportanceAndName(persons), [persons]);

  const resetEditor = (): void => {
    setName("");
    setImportance("medium");
    setPresetIcon(DEFAULT_ICON);
    setCustomIcon("");
    setEditingPersonId(null);
    setIsEditorOpen(false);
  };

  const openCreateEditor = (): void => {
    setName("");
    setImportance("medium");
    setPresetIcon(DEFAULT_ICON);
    setCustomIcon("");
    setEditingPersonId(null);
    setIsEditorOpen(true);
  };

  const openEditEditor = (personId: string): void => {
    const target = persons.find((person) => person.id === personId);
    if (!target) {
      return;
    }

    setName(target.name);
    setImportance(target.importance);

    if (ICON_OPTIONS.includes(target.icon as (typeof ICON_OPTIONS)[number])) {
      setPresetIcon(target.icon as (typeof ICON_OPTIONS)[number]);
      setCustomIcon("");
    } else {
      setPresetIcon(DEFAULT_ICON);
      setCustomIcon(target.icon);
    }

    setEditingPersonId(target.id);
    setIsEditorOpen(true);
  };

  const handleSubmit = async (): Promise<void> => {
    const selectedIcon = customIcon.trim() || presetIcon || DEFAULT_ICON;

    if (editingPersonId) {
      await updatePerson({
        id: editingPersonId,
        icon: selectedIcon,
        name,
        importance,
      });
    } else {
      await addPerson({
        icon: selectedIcon,
        name,
        importance,
      });
    }

    resetEditor();
  };

  const handleDelete = async (personId: string): Promise<void> => {
    const shouldDelete = window.confirm("このプロフィールを削除しますか？");
    if (!shouldDelete) {
      return;
    }

    await deletePerson(personId);
  };

  return (
    <PageLayout title="プロフィール選択" showNav={false}>
      <div className="person-selector-page">
        <section className="person-selector-list-area" aria-label="プロフィール一覧エリア">
          <div className="person-selector-toolbar">
            <p>プロフィール一覧（重要度順）</p>
            <button onClick={() => navigate("/")} disabled={sortedPersons.length === 0}>
              メインへ進む
            </button>
          </div>

          {isEditorOpen && (
            <div className="card person-editor-card">
              <p>{editingPersonId ? "プロフィール編集" : "プロフィール追加"}</p>

              <label htmlFor="person-name">名前</label>
              <input
                id="person-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: Hanako"
              />

              <p>アイコン選択（デフォルトあり）</p>
              <div className="icon-picker" role="radiogroup" aria-label="アイコン選択">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={`icon-option ${presetIcon === icon ? "selected" : ""}`}
                    onClick={() => setPresetIcon(icon)}
                  >
                    {icon}
                  </button>
                ))}
              </div>

              <label htmlFor="custom-icon">カスタムアイコン（任意）</label>
              <input
                id="custom-icon"
                value={customIcon}
                onChange={(e) => setCustomIcon(e.target.value)}
                placeholder="例: 🐶"
              />

              <label htmlFor="person-importance">重要度</label>
              <select
                id="person-importance"
                value={importance}
                onChange={(e) => setImportance(e.target.value as PersonImportance)}
              >
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>

              <div className="person-editor-actions">
                <button type="button" onClick={() => void handleSubmit()} disabled={!name.trim()}>
                  {editingPersonId ? "保存" : "作成"}
                </button>
                <button type="button" onClick={resetEditor}>
                  キャンセル
                </button>
              </div>
            </div>
          )}

          {sortedPersons.length === 0 && <p>まずプロフィールを追加してください。</p>}

          <div className="person-cards">
            {sortedPersons.map((person) => (
              <article
                key={person.id}
                className={`profile-card ${selectedPersonId === person.id ? "selected" : ""}`}
                onClick={() => void selectPerson(person.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    void selectPerson(person.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <span className="profile-card-icon">{person.icon}</span>
                <span className="profile-card-name">{person.name}</span>
                <span className="profile-card-priority">重要度: {importanceLabel[person.importance]}</span>

                <div className="profile-card-actions">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openEditEditor(person.id);
                    }}
                  >
                    編集
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleDelete(person.id);
                    }}
                  >
                    削除
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="person-selector-footer" aria-label="追加ボタンエリア">
          <button type="button" onClick={openCreateEditor}>
            新しいプロフィールを追加
          </button>
        </section>
      </div>
    </PageLayout>
  );
};
