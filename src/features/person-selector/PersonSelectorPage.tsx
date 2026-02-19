import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../app/providers/AppProvider";
import { PageLayout } from "../../shared/ui/PageLayout";

export const PersonSelectorPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { persons, selectedPersonId, addPerson, selectPerson } = useAppContext();
  const [name, setName] = useState("");

  const handleAdd = async (): Promise<void> => {
    await addPerson(name);
    setName("");
  };

  const handleStart = async (): Promise<void> => {
    if (!selectedPersonId && persons.length > 0) {
      await selectPerson(persons[0].id);
    }

    navigate("/");
  };

  return (
    <PageLayout title="対象選択" showNav={false}>
      <div className="card">
        <label htmlFor="person-name">名前を追加</label>
        <input id="person-name" value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={handleAdd}>追加</button>
      </div>

      <div className="card">
        <p>採点対象</p>
        {persons.length === 0 && <p>まず1人追加してください。</p>}
        {persons.map((person) => (
          <button
            key={person.id}
            className={selectedPersonId === person.id ? "selected" : ""}
            onClick={() => void selectPerson(person.id)}
          >
            {person.name}
          </button>
        ))}
      </div>

      <button onClick={handleStart} disabled={persons.length === 0}>
        セッション開始
      </button>
    </PageLayout>
  );
};
