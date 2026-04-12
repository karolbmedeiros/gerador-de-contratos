"use client";

import { create } from "zustand";
import { GeneratedContract } from "@/types";

const STORAGE_KEY = "contract_generated";

interface ContractStore {
  contracts: GeneratedContract[];
  addContract: (contract: GeneratedContract) => void;
  removeContract: (id: string) => void;
  hydrateFromStorage: () => void;
}

export const useContractStore = create<ContractStore>((set) => ({
  contracts: [],

  addContract: (contract) => {
    set((state) => {
      const updated = [contract, ...state.contracts];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
      }
      return { contracts: updated };
    });
  },

  removeContract: (id) => {
    set((state) => {
      const updated = state.contracts.filter((c) => c.id !== id);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
      }
      return { contracts: updated };
    });
  },

  hydrateFromStorage: () => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as GeneratedContract[];
        set({ contracts: parsed });
      }
    } catch {}
  },
}));
