"use client";

import { useState, useEffect } from "react";
import { useTemplateStore } from "@/lib/store/useTemplateStore";
import { useContractStore } from "@/lib/store/useContractStore";
import { Template, Replacement, GeneratedContract } from "@/types";
import { applyReplacementsToDocx, downloadDocx } from "@/lib/docx/applyReplacements";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Download, Wand2, AlertCircle, CheckCircle2 } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  Residencial: "bg-green-100 text-green-700",
  Comercial: "bg-blue-100 text-blue-700",
  Temporada: "bg-amber-100 text-amber-700",
  Outros: "bg-gray-100 text-gray-600",
};

export default function GeneratePage() {
  const templates = useTemplateStore((s) => s.templates);
  const getTemplateById = useTemplateStore((s) => s.getTemplateById);
  const addContract = useContractStore((s) => s.addContract);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  useEffect(() => {
    if (!selectedTemplateId && templates.length > 0) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates]);
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    replacements: Replacement[];
    tenantName: string;
    fileName: string;
    outputBase64: string;
  } | null>(null);

  const selectedTemplate: Template | undefined = selectedTemplateId
    ? getTemplateById(selectedTemplateId)
    : undefined;

  async function handleGenerate() {
    if (!selectedTemplate) {
      setError("Selecione um template.");
      return;
    }
    if (!instructions.trim()) {
      setError("Descreva as informações a serem alteradas no contrato.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extractedText: selectedTemplate.extractedText,
          instructions: instructions.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro desconhecido");
      }

      const { replacements, tenantName } = data as {
        replacements: Replacement[];
        tenantName: string;
      };

      const outputBase64 = await applyReplacementsToDocx(
        selectedTemplate.fileBase64,
        replacements
      );

      const safeName = tenantName.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, "").trim();
      const fileName = `Contrato_${safeName}_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.docx`;

      const contract: GeneratedContract = {
        id: crypto.randomUUID(),
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        tenantName,
        instructions: instructions.trim(),
        replacements,
        outputFileBase64: outputBase64,
        generatedAt: new Date().toISOString(),
      };

      addContract(contract);
      downloadDocx(outputBase64, fileName);

      setResult({ replacements, tenantName, fileName, outputBase64 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao gerar contrato.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* Template selector */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Template de contrato</label>
          {templates.length === 0 ? (
            <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
              Nenhum template disponível. Adicione templates na página{" "}
              <a href="/templates" className="underline font-medium">Templates</a>.
            </p>
          ) : (
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <div className="flex items-center gap-2">
                      <span>{t.name}</span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                          CATEGORY_COLORS[t.category] ?? CATEGORY_COLORS["Outros"]
                        }`}
                      >
                        {t.category}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Template preview */}
        {selectedTemplate && (
          <Accordion type="single" collapsible>
            <AccordionItem value="preview" className="border rounded-lg px-3">
              <AccordionTrigger className="text-sm text-gray-600 hover:no-underline py-2">
                Visualizar texto do template
              </AccordionTrigger>
              <AccordionContent>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded max-h-48 overflow-auto">
                  {selectedTemplate.extractedText}
                </pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {/* Instructions */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Instruções de preenchimento</label>
          <Textarea
            rows={7}
            placeholder="Descreva as informações do locatário, avalista, endereço, valores e qualquer outra alteração necessária.&#10;&#10;Exemplo: O locatário é João da Silva, CPF 111.222.333-44, RG 1.234.567, residente na Rua das Flores, 100, Apto 201, Bairro Jardim, São Paulo/SP. Avalista: Maria Souza, CPF 555.666.777-88. Imóvel: Rua Principal, 500. Aluguel: R$ 2.500,00. Prazo: 30 meses. Início: 01/05/2026."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="text-sm resize-none"
          />
          <p className="text-xs text-gray-400 text-right">{instructions.length} caracteres</p>
        </div>

        {error && (
          <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={loading || !selectedTemplateId || !instructions.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analisando contrato...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Gerar Contrato
            </>
          )}
        </Button>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-semibold text-sm">Contrato gerado com sucesso!</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadDocx(result.outputBase64, result.fileName)}
              className="gap-1.5"
            >
              <Download className="w-4 h-4" />
              Baixar novamente
            </Button>
          </div>

          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <p>
              <span className="font-medium">Locatário:</span> {result.tenantName}
            </p>
            <p>
              <span className="font-medium">Arquivo:</span> {result.fileName}
            </p>
          </div>

          {result.replacements.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Substituições aplicadas ({result.replacements.length})
              </p>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-xs py-2">Original</TableHead>
                      <TableHead className="text-xs py-2">Substituído por</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.replacements.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs font-mono text-gray-500 py-2">
                          {r.original}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-gray-900 py-2">
                          {r.replacement}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
