import type { StorageMode } from "../entities/settings";
import { localStorageAdapter } from "./adapters/local/localStorageAdapter";
import { firebaseStorageAdapter } from "./adapters/remote/firebaseStorageAdapter";
import type { StorageAdapter } from "./types";

export const createStorageAdapter = (mode: StorageMode): StorageAdapter => {
  if (mode === "remote") {
    return firebaseStorageAdapter;
  }

  return localStorageAdapter;
};
