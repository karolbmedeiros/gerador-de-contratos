"use client";

import { useState } from "react";
import { useTemplateStore } from "@/lib/store/useTemplateStore";
import { TemplateCategory } from "@/types";
import { TemplateUploader } from "@/components/templates/TemplateUploader";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { CategoryFilter } from "@/components/templates/CategoryFilter";
import { FolderOpen } from "lucide-react";

export default function TemplatesPage() {
  const templates = useTemplateStore((s) => s.templates);
  const [filter, setFilter] = useState<TemplateCategory | "Todos">("Todos");

  const filtered =
    filter === "Todos" ? templates : templates.filter((t) => t.category === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Uploader */}
        <div className="lg:col-span-1">
          <TemplateUploader />
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <CategoryFilter selected={filter} onChange={setFilter} />
            <span className="text-sm text-gray-500">
              {filtered.length} template{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Nenhum template encontrado</p>
              <p className="text-xs mt-1">
                {filter === "Todos"
                  ? "Adicione um template usando o painel ao lado"
                  : `Nenhum template na categoria "${filter}"`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((t) => (
                <TemplateCard key={t.id} template={t} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
