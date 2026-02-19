import type { DateEvent } from "../entities/score";
import type { AppSettings } from "../entities/settings";
import type { SessionState } from "../entities/session";

export interface StorageAdapter {
  loadSessionState(): Promise<SessionState>;
  saveSessionState(state: SessionState): Promise<void>;
  listEvents(personId: string): Promise<DateEvent[]>;
  saveEvent(event: DateEvent): Promise<void>;
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<void>;
}
