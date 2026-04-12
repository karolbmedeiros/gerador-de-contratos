"use client";

import { useEffect } from "react";
import { useTemplateStore } from "@/lib/store/useTemplateStore";
import { useContractStore } from "@/lib/store/useContractStore";

export function HydrationProvider({ children }: { children: React.ReactNode }) {
  const hydrateTemplates = useTemplateStore((s) => s.hydrateFromStorage);
  const hydrateContracts = useContractStore((s) => s.hydrateFromStorage);

  useEffect(() => {
    hydrateTemplates();
    hydrateContracts();
  }, [hydrateTemplates, hydrateContracts]);

  return <>{children}</>;
}
