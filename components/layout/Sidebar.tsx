"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, FilePlus, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/templates", label: "Templates", icon: FolderOpen },
  { href: "/generate", label: "Gerar Contrato", icon: FilePlus },
  { href: "/contracts", label: "Contratos Gerados", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-gray-900 flex flex-col z-10">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">ContratoGen</p>
            <p className="text-gray-400 text-xs">Gerador de Contratos</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-700">
        <p className="text-gray-500 text-xs">Imobiliária Exemplo LTDA</p>
      </div>
    </aside>
  );
}
