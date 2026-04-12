"use client";

import { useState, useRef, DragEvent } from "react";
import { useTemplateStore } from "@/lib/store/useTemplateStore";
import { TemplateCategory } from "@/types";
import { extractTextFromDocx, arrayBufferToBase64 } from "@/lib/docx/extractText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES: TemplateCategory[] = ["Residencial", "Comercial", "Temporada", "Outros"];

export function TemplateUploader() {
  const addTemplate = useTemplateStore((s) => s.addTemplate);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<TemplateCategory>("Residencial");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    if (!f.name.endsWith(".docx")) {
      setError("Apenas arquivos .docx são aceitos.");
      return;
    }
    setError("");
    setFile(f);
    if (!name) setName(f.name.replace(".docx", "").replace(/_/g, " "));
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleUpload() {
    if (!file || !name.trim()) {
      setError("Selecione um arquivo e informe o nome do template.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const extractedText = await extractTextFromDocx(arrayBuffer);
      const fileBase64 = arrayBufferToBase64(arrayBuffer);

      addTemplate({
        id: crypto.randomUUID(),
        name: name.trim(),
        category,
        fileName: file.name,
        fileBase64,
        extractedText,
        uploadedAt: new Date().toISOString(),
        sizeBytes: file.size,
      });

      setSuccess(true);
      setFile(null);
      setName("");
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Erro ao processar o arquivo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <h2 className="font-semibold text-gray-900 text-sm">Adicionar Novo Template</h2>

      {/* Drop zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          dragging
            ? "border-blue-400 bg-blue-50"
            : file
            ? "border-green-400 bg-green-50"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".docx"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {file ? (
          <div className="flex items-center justify-center gap-2 text-green-700">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">{file.name}</span>
          </div>
        ) : (
          <div className="space-y-1">
            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm text-gray-600 font-medium">Clique ou arraste um arquivo .docx</p>
            <p className="text-xs text-gray-400">Somente arquivos Word (.docx)</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-700">Nome do template</Label>
          <Input
            placeholder="Ex: Contrato Residencial Padrão"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-700">Categoria</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as TemplateCategory)}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {success && <p className="text-xs text-green-600">Template adicionado com sucesso!</p>}

      <Button
        onClick={handleUpload}
        disabled={loading || !file}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Adicionar Template
          </>
        )}
      </Button>
    </div>
  );
}
