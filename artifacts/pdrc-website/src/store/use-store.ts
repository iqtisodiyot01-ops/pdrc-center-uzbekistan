import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "uz" | "en" | "ru";

export interface AppUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  permissions?: Record<string, boolean> | null;
  createdAt?: string;
}

interface AppState {
  lang: Language;
  setLang: (lang: Language) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  user: AppUser | null;
  setUser: (user: AppUser | null) => void;
  logout: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  siteTexts: Record<string, Record<string, Record<string, string>>> | null;
  setSiteTexts: (texts: Record<string, Record<string, Record<string, string>>>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      lang: "uz",
      setLang: (lang) => set({ lang }),
      token: null,
      setToken: (token) => set({ token }),
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
      cartOpen: false,
      setCartOpen: (open) => set({ cartOpen: open }),
      siteTexts: null,
      setSiteTexts: (texts) => set({ siteTexts: texts }),
    }),
    {
      name: "pdrc-storage",
      partialize: (state) => ({ lang: state.lang, token: state.token }),
    }
  )
);
