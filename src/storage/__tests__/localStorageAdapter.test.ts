import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { localStorageAdapter } from "../adapters/local/localStorageAdapter";
import type { AppSettings } from "../../entities/settings";

beforeAll(() => {
  if (typeof globalThis.localStorage !== "undefined") {
    return;
  }

  const store = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    writable: true,
    value: storage,
  });
});

beforeEach(() => {
  localStorage.clear();
});

describe("localStorageAdapter", () => {
  it("saves and loads session state", async () => {
    await localStorageAdapter.saveSessionState({ selectedPersonId: "p1" });
    const state = await localStorageAdapter.loadSessionState();

    expect(state.selectedPersonId).toBe("p1");
  });

  it("saves and lists events for one person", async () => {
    await localStorageAdapter.saveEvent({
      id: "e1",
      personId: "p1",
      date: "2026-02-19",
      scores: [{ categoryId: "fun", importance: 5, satisfaction: 80 }],
    });

    await localStorageAdapter.saveEvent({
      id: "e2",
      personId: "p2",
      date: "2026-02-19",
      scores: [{ categoryId: "fun", importance: 5, satisfaction: 30 }],
    });

    const p1Events = await localStorageAdapter.listEvents("p1");
    expect(p1Events).toHaveLength(1);
    expect(p1Events[0]?.id).toBe("e1");
  });

  it("saves and loads settings", async () => {
    const settings: AppSettings = {
      categories: [
        { id: "conversation", label: "会話", enabled: true },
        { id: "fun", label: "楽しさ", enabled: true },
        { id: "comfort", label: "居心地", enabled: true },
        { id: "kindness", label: "優しさ", enabled: true },
        { id: "future", label: "将来性", enabled: true },
      ],
      selectedRadarCategoryIds: ["conversation", "fun", "comfort", "kindness", "future"],
      storageMode: "local",
    };

    await localStorageAdapter.saveSettings(settings);
    const loaded = await localStorageAdapter.getSettings();

    expect(loaded).toEqual(settings);
  });
});
