"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type TableStore = {
  totalTables: number;
  setTotalTables: (n: number) => void;
  addTable: () => void;
  removeTable: () => void;
};

export const MIN_TABLES = 1;
export const MAX_TABLES = 30;

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
    { name: "restaurant-tables" }
  )
);
