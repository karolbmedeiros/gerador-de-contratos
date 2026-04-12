"use client";

import { create } from "zustand";
import { Template } from "@/types";
import { MOCK_TEMPLATES } from "@/lib/utils/mockData";

const STORAGE_KEY = "contract_templates";

interface TemplateStore {
  templates: Template[];
  addTemplate: (template: Template) => void;
  removeTemplate: (id: string) => void;
  getTemplateById: (id: string) => Template | undefined;
  hydrateFromStorage: () => void;
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: [],

  addTemplate: (template) => {
    set((state) => {
      const updated = [...state.templates, template];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
      }
      return { templates: updated };
    });
  },

  removeTemplate: (id) => {
    set((state) => {
      const updated = state.templates.filter((t) => t.id !== id);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
      }
      return { templates: updated };
    });
  },

  getTemplateById: (id) => {
    return get().templates.find((t) => t.id === id);
  },

  hydrateFromStorage: () => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Template[];
        set({ templates: parsed });
      } else {
        set({ templates: MOCK_TEMPLATES });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_TEMPLATES));
      }
    } catch {
      set({ templates: MOCK_TEMPLATES });
    }
  },
}));
