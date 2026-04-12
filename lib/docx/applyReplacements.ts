import { Replacement } from "@/types";
import { base64ToUint8Array } from "./extractText";

export async function applyReplacementsToDocx(
  fileBase64: string,
  replacements: Replacement[]
): Promise<string> {
  const PizZip = (await import("pizzip")).default;

  const bytes = base64ToUint8Array(fileBase64);
  const zip = new PizZip(bytes);

  const docXml = zip.file("word/document.xml");
  if (!docXml) {
    throw new Error("Arquivo DOCX inválido: word/document.xml não encontrado.");
  }

  let xmlContent = docXml.asText();

  for (const { original, replacement } of replacements) {
    // Escape special regex chars in the original string
    const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    xmlContent = xmlContent.replace(new RegExp(escaped, "g"), replacement);
  }

  zip.file("word/document.xml", xmlContent);

  const outputBuffer = zip.generate({ type: "uint8array" });

  // Convert Uint8Array to base64
  let binary = "";
  for (let i = 0; i < outputBuffer.byteLength; i++) {
    binary += String.fromCharCode(outputBuffer[i]);
  }
  return btoa(binary);
}

export function downloadDocx(base64: string, fileName: string): void {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
