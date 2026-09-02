import { create } from "zustand";
import { Theme } from "@/types/theme";

import api from "@/lib/axios";

type ThemeStore = {
  themes: Theme[];

  isLoading: boolean;

  fetchThemes: () => Promise<void>;

  addTheme: (theme: Theme) => void;

  setThemes: (themes: Theme[]) => void;

  clearThemes: () => void;
};

export const useThemeStore = create<ThemeStore>((set, get) => ({
  themes: [],

  isLoading: false,

  fetchThemes: async () => {
    if (get().themes.length > 0) {
      return;
    }

    try {
      set({
        isLoading: true,
      });

      const { data } = await api.get("/master-theme");
      console.log("theme: ", data);

      set({
        themes: data.data,

        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch themes:", error);

      set({
        isLoading: false,
      });
    }
  },

  addTheme: (theme) =>
    set((state) => ({
      themes: [...state.themes, theme],
    })),

  setThemes: (themes) => set({ themes }),

  clearThemes: () => set({ themes: [] }),
}));
