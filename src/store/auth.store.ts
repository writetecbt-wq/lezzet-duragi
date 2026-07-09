"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserRole = "admin" | "garson";

type AuthUser = {
  id: string;
  role: UserRole;
  displayName: string;
};

type AuthStore = {
  user: AuthUser | null;
  isAuthenticated: boolean;

  login: (username: string, password: string) => { success: boolean; error?: string; role?: UserRole };
  logout: () => void;
};

// Hardcoded credentials
const CREDENTIALS: Array<{ username: string; password: string; role: UserRole; displayName: string }> = [
  { username: "admin", password: "kasa123", role: "admin", displayName: "Kasa Yöneticisi" },
  { username: "admin", password: "garson123", role: "garson", displayName: "Garson" },
];

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

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (username, password) => {
        const match = CREDENTIALS.find(
          (c) => c.username === username && c.password === password
        );

        if (!match) {
          return { success: false, error: "Kullanıcı adı veya şifre hatalı" };
        }

        const user: AuthUser = {
          id: `user_${match.role}_${Date.now()}`,
          role: match.role,
          displayName: match.displayName,
        };

        set({ user, isAuthenticated: true });
        return { success: true, role: match.role };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "restaurant-auth",
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
