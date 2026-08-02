import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages, videoContext } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY || process.env.IVCA_GEMINI_API;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY / IVCA_GEMINI_API is not set." }, { status: 500 });
  }

  const systemPrompt = `Jsi AI asistent pro Iva – Data Engineera & AI Specialist (Azure stack, AI Automations).
Analyzuješ YouTube video a odpovídáš na dotazy k jeho obsahu.
Mluv česky, technické termíny anglicky. Buď konkrétní a praktický. Bez omáčky.

Kontext videa:
Název: ${videoContext.title}
Kanál: ${videoContext.channel}
Shrnutí: ${videoContext.summary || "(nedostupné)"}
Klíčové body: ${(videoContext.key_points || []).join(", ") || "(nedostupné)"}
Tagy: ${videoContext.tags || ""}

Pomáhej Ivovi pochopit jak použít obsah videa v jeho situaci:
- práce v Azure ADF, Databricks, Service Bus, Event Hub
- učení se data engineering a AI/LLM automacím
- budování AIVOS osobního AI OS
- certifikace a seberozvoj (AZ-900, etc)`;

  const geminiMessages = [
    { role: "user", parts: [{ text: systemPrompt + "\n\nPozdrav uživatele a zeptej se co chce vědět o tomto videu." }] },
    { role: "model", parts: [{ text: `Ahoj! Mám tady video "${videoContext.title}" od ${videoContext.channel}. Co tě k němu zajímá?` }] },
    ...messages.map((m: { role: string; text: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    })),
  ];

  const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];
  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: geminiMessages, generationConfig: { temperature: 0.7, maxOutputTokens: 1024 } }),
      });
      if (res.status === 429) continue;
      if (!res.ok) continue;
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Nepodařilo se získat odpověď.";
      return NextResponse.json({ text });
    } catch {
      continue;
    }
  }

  return NextResponse.json({ error: "Gemini API je momentálně přetížené. Zkuste to prosím za chvíli." }, { status: 429 });
}
