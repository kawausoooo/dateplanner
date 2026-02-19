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
import type { Person } from "../../entities/person";
import { DEFAULT_SETTINGS } from "../../shared/config/defaults";
import { createStorageAdapter } from "../../storage/createStorageAdapter";
import { toIsoDate } from "../../shared/lib/date";

const PEOPLE_KEY = "aisho/persons";

type AppContextValue = {
  persons: Person[];
  selectedPersonId: string | null;
  settings: AppSettings;
  isLoaded: boolean;
  addPerson: (name: string) => Promise<void>;
  selectPerson: (personId: string) => Promise<void>;
  listEvents: () => Promise<DateEvent[]>;
  addDateEvent: (event: Omit<DateEvent, "id" | "personId" | "date"> & { date?: string }) => Promise<void>;
  updateSettings: (settings: AppSettings) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

const loadPeople = (): Person[] => {
  const raw = localStorage.getItem(PEOPLE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as Person[];
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

  const addPerson = useCallback(async (name: string): Promise<void> => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    const person: Person = {
      id: crypto.randomUUID(),
      name: trimmed,
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
      selectPerson,
      listEvents,
      addDateEvent,
      updateSettings,
    }),
    [persons, selectedPersonId, settings, isLoaded, addPerson, selectPerson, listEvents, addDateEvent, updateSettings],
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
