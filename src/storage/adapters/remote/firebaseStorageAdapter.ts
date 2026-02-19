import type { StorageAdapter } from "../../types";

const notImplemented = async (): Promise<never> => {
  throw new Error("Firebase adapter is not implemented yet.");
};

export const firebaseStorageAdapter: StorageAdapter = {
  loadSessionState: notImplemented,
  saveSessionState: notImplemented,
  listEvents: notImplemented,
  saveEvent: notImplemented,
  getSettings: notImplemented,
  saveSettings: notImplemented,
};
