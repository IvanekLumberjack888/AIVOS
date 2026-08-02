import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages, videoContext } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY || process.env.IVCA_GEMINI_API;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY / IVCA_GEMINI_API not set" }, { status: 500 });
  }

  const systemPrompt = `Jsi AI asistent pro Iva – Junior Data Engineera (Konica Minolta, Azure stack, ADHD-PI, INTJ).
Analyzuješ YouTube video a odpovídáš na dotazy k jeho obsahu.
Mluv česky, technické termíny anglicky. Buď konkrétní a praktický.
Vyhni se omáčce – rovnou k věci.

Kontext videa:
Název: ${videoContext.title}
Kanál: ${videoContext.channel}
Shrnutí: ${videoContext.summary}
Klíčové body: ${(videoContext.key_points || []).join(", ")}
Akční krok: ${videoContext.action}
Tagy: ${videoContext.tags}

Pomáhej Ivovi pochopit jak použít obsah videa v jeho konkrétní situaci:
- práce v Konica Minolta (Azure ADF, Databricks, Service Bus)
- učení se data engineering a AI
- budování AIVOS osobního AI OS
- certifikace a seberozvoj (AZ-900, etc)`;

  const geminiMessages = [
    { role: "user", parts: [{ text: systemPrompt + "\n\nPozdrav uživatele a zeptej se co chce vědět o tomto videu." }] },
    { role: "model", parts: [{ text: `Ahoj! Mám tady video "${videoContext.title}" od ${videoContext.channel}. Co tě zajímá?` }] },
    ...messages.map((m: { role: string; text: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    })),
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: geminiMessages }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Nepodařilo se získat odpověď.";
  return NextResponse.json({ text });
}
