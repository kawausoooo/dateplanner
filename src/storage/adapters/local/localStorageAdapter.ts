import type { DateEvent } from "../../../entities/score";
import type { AppSettings } from "../../../entities/settings";
import type { SessionState } from "../../../entities/session";
import { DEFAULT_SETTINGS } from "../../../shared/config/defaults";
import { STORAGE_KEYS } from "../../keys";
import type { StorageAdapter } from "../../types";

const fallbackSession: SessionState = {
  selectedPersonId: null,
};

const readJson = <T>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const localStorageAdapter: StorageAdapter = {
  async loadSessionState() {
    return readJson(STORAGE_KEYS.session, fallbackSession);
  },

  async saveSessionState(state) {
    writeJson(STORAGE_KEYS.session, state);
  },

  async listEvents(personId: string) {
    const allEvents = readJson<DateEvent[]>(STORAGE_KEYS.events, []);
    return allEvents.filter((event) => event.personId === personId);
  },

  async saveEvent(event: DateEvent) {
    const allEvents = readJson<DateEvent[]>(STORAGE_KEYS.events, []);
    allEvents.push(event);
    writeJson(STORAGE_KEYS.events, allEvents);
  },

  async getSettings() {
    return readJson<AppSettings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  },

  async saveSettings(settings: AppSettings) {
    writeJson(STORAGE_KEYS.settings, settings);
  },
};
