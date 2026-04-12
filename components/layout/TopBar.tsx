"use client";

import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/templates": "Templates de Contrato",
  "/generate": "Gerar Contrato",
  "/contracts": "Contratos Gerados",
};

export function TopBar() {
  const pathname = usePathname();
  const title = titles[pathname] ?? "ContratoGen";

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6">
      <h1 className="text-gray-900 font-semibold text-base">{title}</h1>
    </header>
  );
}
