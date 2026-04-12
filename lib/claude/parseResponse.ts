import { Replacement } from "@/types";

export interface ParsedClaudeResponse {
  replacements: Replacement[];
  tenantName: string;
}

export function parseClaudeResponse(raw: string): ParsedClaudeResponse {
  // Strip markdown code fences if present
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned) as Array<Record<string, string>>;

  let tenantName = "Locatário";
  const replacements: Replacement[] = [];

  for (const item of parsed) {
    if ("tenantName" in item) {
      tenantName = item.tenantName || "Locatário";
      continue;
    }
    if (
      typeof item.original === "string" &&
      typeof item.replacement === "string" &&
      item.original.length > 0 &&
      item.original.length <= 500
    ) {
      replacements.push({ original: item.original, replacement: item.replacement });
    }
  }

  return { replacements, tenantName };
}
