"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type TableStore = {
  totalTables: number;
  setTotalTables: (n: number) => void;
  addTable: () => void;
  removeTable: () => void;
};

export const MIN_TABLES = 1;
export const MAX_TABLES = 100;

const safeStorage = {
  getItem: (name: string) => {
    try { return localStorage.getItem(name); } catch { return null; }
  },
  setItem: (name: string, value: string) => {
    try { localStorage.setItem(name, value); } catch {}
  },
  removeItem: (name: string) => {
    try { localStorage.removeItem(name); } catch {}
  },
};

export const useTableStore = create<TableStore>()(
  persist(
    (set, get) => ({
      totalTables: 10,

      setTotalTables: (n) =>
        set({ totalTables: Math.min(MAX_TABLES, Math.max(MIN_TABLES, n)) }),

      addTable: () =>
        set((s) => ({
          totalTables: Math.min(MAX_TABLES, s.totalTables + 1),
        })),

      removeTable: () =>
        set((s) => ({
          totalTables: Math.max(MIN_TABLES, s.totalTables - 1),
        })),
    }),
    { 
      name: "restaurant-tables",
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
