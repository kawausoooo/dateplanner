import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { DateEvent } from "../../entities/score";
import type { AppSettings } from "../../entities/settings";
import type { Person, PersonImportance } from "../../entities/person";
import { DEFAULT_SETTINGS } from "../../shared/config/defaults";
import { createStorageAdapter } from "../../storage/createStorageAdapter";
import { toIsoDate } from "../../shared/lib/date";

const PEOPLE_KEY = "aisho/persons";

type AppContextValue = {
  persons: Person[];
  selectedPersonId: string | null;
  settings: AppSettings;
  isLoaded: boolean;
  addPerson: (personInput: { icon: string; name: string; importance: PersonImportance }) => Promise<void>;
  updatePerson: (personInput: { id: string; icon: string; name: string; importance: PersonImportance }) => Promise<void>;
  deletePerson: (personId: string) => Promise<void>;
  selectPerson: (personId: string) => Promise<void>;
  listEvents: () => Promise<DateEvent[]>;
  addDateEvent: (event: Omit<DateEvent, "id" | "personId" | "date"> & { date?: string }) => Promise<void>;
  updateSettings: (settings: AppSettings) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

const toImportance = (value: unknown): PersonImportance => {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }

  if (typeof value === "number") {
    if (value >= 3) {
      return "high";
    }
    if (value === 2) {
      return "medium";
    }
    return "low";
  }

  return "medium";
};

const loadPeople = (): Person[] => {
  const raw = localStorage.getItem(PEOPLE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as Array<Partial<Person>>;

    return parsed
      .filter((person) => typeof person.id === "string" && typeof person.name === "string")
      .map((person) => ({
        id: person.id!,
        name: person.name!,
        icon: typeof person.icon === "string" ? person.icon : "🙂",
        importance: toImportance((person as { importance?: unknown }).importance ?? (person as { priority?: unknown }).priority),
        createdAt: typeof person.createdAt === "string" ? person.createdAt : new Date().toISOString(),
      }));
  } catch {
    return [];
  }
};

const savePeople = (people: Person[]): void => {
  localStorage.setItem(PEOPLE_KEY, JSON.stringify(people));
};

export const AppProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  const adapter = useMemo(() => createStorageAdapter(settings.storageMode), [settings.storageMode]);

  useEffect(() => {
    const bootstrap = async (): Promise<void> => {
      const loadedPeople = loadPeople();
      const [sessionState, loadedSettings] = await Promise.all([
        adapter.loadSessionState(),
        adapter.getSettings(),
      ]);

      setPersons(loadedPeople);
      setSelectedPersonId(sessionState.selectedPersonId);
      setSettings(loadedSettings);
      setIsLoaded(true);
    };

    void bootstrap();
  }, [adapter]);

  const addPerson = useCallback(async (personInput: { icon: string; name: string; importance: PersonImportance }): Promise<void> => {
    const trimmed = personInput.name.trim();
    if (!trimmed) {
      return;
    }

    const person: Person = {
      id: crypto.randomUUID(),
      icon: personInput.icon.trim() || "🙂",
      name: trimmed,
      importance: personInput.importance,
      createdAt: new Date().toISOString(),
    };

    setPersons((prev) => {
      const next = [...prev, person];
      savePeople(next);
      return next;
    });
    setSelectedPersonId(person.id);
    await adapter.saveSessionState({ selectedPersonId: person.id });
  }, [adapter]);

  const updatePerson = useCallback(async (personInput: {
    id: string;
    icon: string;
    name: string;
    importance: PersonImportance;
  }): Promise<void> => {
    const trimmed = personInput.name.trim();
    if (!trimmed) {
      return;
    }

    setPersons((prev) => {
      const next = prev.map((person) => (
        person.id === personInput.id
          ? {
              ...person,
              icon: personInput.icon.trim() || "🙂",
              name: trimmed,
              importance: personInput.importance,
            }
          : person
      ));
      savePeople(next);
      return next;
    });
  }, []);

  const deletePerson = useCallback(async (personId: string): Promise<void> => {
    let nextSelectedPersonId: string | null = null;

    setPersons((prev) => {
      const next = prev.filter((person) => person.id !== personId);
      nextSelectedPersonId = selectedPersonId === personId ? (next[0]?.id ?? null) : selectedPersonId;
      savePeople(next);
      return next;
    });

    setSelectedPersonId(nextSelectedPersonId);
    await adapter.saveSessionState({ selectedPersonId: nextSelectedPersonId });
  }, [adapter, selectedPersonId]);

  const selectPerson = useCallback(async (personId: string): Promise<void> => {
    setSelectedPersonId(personId);
    await adapter.saveSessionState({ selectedPersonId: personId });
  }, [adapter]);

  const listEvents = useCallback(async (): Promise<DateEvent[]> => {
    if (!selectedPersonId) {
      return [];
    }

    return adapter.listEvents(selectedPersonId);
  }, [adapter, selectedPersonId]);

  const addDateEvent = useCallback(async (event: Omit<DateEvent, "id" | "personId" | "date"> & { date?: string }): Promise<void> => {
    if (!selectedPersonId) {
      return;
    }

    const normalizedEvent: DateEvent = {
      id: crypto.randomUUID(),
      personId: selectedPersonId,
      date: event.date ?? toIsoDate(new Date()),
      memo: event.memo,
      scores: event.scores,
    };

    await adapter.saveEvent(normalizedEvent);
  }, [adapter, selectedPersonId]);

  const updateSettings = useCallback(async (next: AppSettings): Promise<void> => {
    setSettings(next);
    await adapter.saveSettings(next);
  }, [adapter]);

  const value = useMemo<AppContextValue>(
    () => ({
      persons,
      selectedPersonId,
      settings,
      isLoaded,
      addPerson,
      updatePerson,
      deletePerson,
      selectPerson,
      listEvents,
      addDateEvent,
      updateSettings,
    }),
    [persons, selectedPersonId, settings, isLoaded, addPerson, updatePerson, deletePerson, selectPerson, listEvents, addDateEvent, updateSettings],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }

  return context;
};
