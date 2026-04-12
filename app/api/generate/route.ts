import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CONTRACT_SYSTEM_PROMPT } from "@/lib/claude/prompts";
import { parseClaudeResponse } from "@/lib/claude/parseResponse";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { extractedText, instructions } = await req.json();

    if (!extractedText || !instructions) {
      return NextResponse.json(
        { error: "extractedText e instructions são obrigatórios." },
        { status: 400 }
      );
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      temperature: 0,
      system: CONTRACT_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `TEXTO DO CONTRATO:\n"""\n${extractedText}\n"""\n\nINSTRUÇÕES DO USUÁRIO:\n"""\n${instructions}\n"""\n\nRetorne o JSON array agora.`,
        },
      ],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

    const parsed = parseClaudeResponse(rawText);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Erro na geração:", err);
    return NextResponse.json(
      { error: "Erro ao processar o contrato. Verifique a chave da API e tente novamente." },
      { status: 500 }
    );
  }
}
