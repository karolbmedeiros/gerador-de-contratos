"use client";

import { useContractStore } from "@/lib/store/useContractStore";
import { downloadDocx } from "@/lib/docx/applyReplacements";
import { GeneratedContract } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Button } from "@/components/ui/button";
import { Download, Trash2, FileText } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ContractRow({ contract }: { contract: GeneratedContract }) {
  const removeContract = useContractStore((s) => s.removeContract);

  function handleDownload() {
    const safeName = contract.tenantName.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, "").trim();
    const fileName = `Contrato_${safeName}_${new Date(contract.generatedAt)
      .toLocaleDateString("pt-BR")
      .replace(/\//g, "-")}.docx`;
    downloadDocx(contract.outputFileBase64, fileName);
  }

  return (
    <TableRow>
      <TableCell className="font-medium text-gray-900 text-sm">{contract.tenantName}</TableCell>
      <TableCell className="text-gray-600 text-sm">{contract.templateName}</TableCell>
      <TableCell className="text-gray-500 text-sm">{formatDate(contract.generatedAt)}</TableCell>
      <TableCell className="text-gray-500 text-sm">{contract.replacements.length} campos</TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700" onClick={handleDownload}>
            <Download className="w-4 h-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir contrato?</AlertDialogTitle>
                <AlertDialogDescription>
                  O contrato de &quot;{contract.tenantName}&quot; será removido do histórico.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => removeContract(contract.id)}
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function ContractsPage() {
  const contracts = useContractStore((s) => s.contracts);

  if (contracts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 py-24 text-center">
          <FileText className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h3 className="text-gray-500 font-medium text-sm">Nenhum contrato gerado ainda</h3>
          <p className="text-gray-400 text-xs mt-1">
            Vá até{" "}
            <a href="/generate" className="text-blue-600 underline">
              Gerar Contrato
            </a>{" "}
            para criar o primeiro contrato.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {contracts.length} contrato{contracts.length !== 1 ? "s" : ""} gerado{contracts.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs font-semibold text-gray-500 py-3">Locatário</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 py-3">Template</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 py-3">Data de Geração</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 py-3">Campos Alterados</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 py-3">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((c) => (
              <ContractRow key={c.id} contract={c} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
