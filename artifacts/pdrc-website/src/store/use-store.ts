import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile } from "@workspace/api-client-react";

export type Language = "uz" | "en" | "ru";

interface AppState {
  lang: Language;
  setLang: (lang: Language) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
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
    }),
    {
      name: "pdrc-storage",
      partialize: (state) => ({ lang: state.lang, token: state.token }),
    }
  )
);
