"use client";

import { Template } from "@/types";
import { useTemplateStore } from "@/lib/store/useTemplateStore";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FileText, Trash2, Calendar } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  Residencial: "bg-green-100 text-green-700 border-green-200",
  Comercial: "bg-blue-100 text-blue-700 border-blue-200",
  Temporada: "bg-amber-100 text-amber-700 border-amber-200",
  Outros: "bg-gray-100 text-gray-600 border-gray-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function TemplateCard({ template }: { template: Template }) {
  const removeTemplate = useTemplateStore((s) => s.removeTemplate);

  return (
    <Card className="relative group hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
              {template.name}
            </h3>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-400 hover:text-red-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir template?</AlertDialogTitle>
                <AlertDialogDescription>
                  O template &quot;{template.name}&quot; será removido permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => removeTemplate(template.id)}
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
            CATEGORY_COLORS[template.category] ?? CATEGORY_COLORS["Outros"]
          }`}
        >
          {template.category}
        </span>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{template.fileName}</span>
          <span>{formatSize(template.sizeBytes)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar className="w-3 h-3" />
          <span>Adicionado em {formatDate(template.uploadedAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
