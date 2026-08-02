import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages, videoContext } = await req.json();

  const systemPrompt = `Jsi AI asistent pro Iva – Junior Data Engineera (Konica Minolta, Azure stack, ADHD-PI, INTJ).
Analyzuješ YouTube video a odpovídáš na dotazy k jeho obsahu.
Mluv česky, technické termíny anglicky. Buď konkrétní a praktický. Bez omáčky.

Kontext videa:
Název: ${videoContext.title}
Kanál: ${videoContext.channel}
Shrnutí: ${videoContext.summary || "(nedostupné)"}
Klíčové body: ${(videoContext.key_points || []).join(", ") || "(nedostupné)"}
Tagy: ${videoContext.tags || ""}

Pomáhej Ivovi pochopit jak použít obsah videa v jeho situaci:
- práce v Konica Minolta (Azure ADF, Databricks, Service Bus, Event Hub)
- learning data engineering a AI/LLM
- budování AIVOS osobního AI OS
- certifikace a seberozvoj (AZ-900, etc)`;

  const anthropicMessages = messages.map((m: { role: string; text: string }) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: m.text,
  }));

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemPrompt,
        messages: anthropicMessages,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Anthropic API error:", err);
      // Fallback na Gemini
      return await geminiCall(messages, videoContext);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text ?? "Nepodařilo se získat odpověď.";
    return NextResponse.json({ text });

  } catch (err) {
    console.error("Anthropic error:", err);
    return await geminiCall(messages, videoContext);
  }
}

async function geminiCall(messages: { role: string; text: string }[], videoContext: Record<string, unknown>) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.IVCA_GEMINI_API;
  if (!apiKey) return NextResponse.json({ error: "Žádný AI model není dostupný." }, { status: 500 });

  const contents = messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.text }],
  }));

  const models = ["gemini-1.5-flash-8b", "gemini-2.0-flash", "gemini-1.5-flash"];
  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents, generationConfig: { temperature: 0.7, maxOutputTokens: 1024 } }),
      });
      if (res.status === 429) continue;
      if (!res.ok) continue;
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Nepodařilo se získat odpověď.";
      return NextResponse.json({ text });
    } catch { continue; }
  }
  return NextResponse.json({ error: "Všechny modely jsou momentálně přetížené. Zkus za chvíli." }, { status: 429 });
}
