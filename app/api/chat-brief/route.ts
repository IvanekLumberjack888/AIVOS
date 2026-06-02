import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages, videoContext } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });
  }

  const systemInstruction = `Jsi AI asistent pro Iva – Junior Data Engineera (Konica Minolta, Azure stack, ADHD-PI, INTJ).
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
- DP-700 certifikace`;

  // Gemini conversation format
  const contents = messages.map((m: { role: string; text: string }) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.text }],
  }));

  const body = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Gemini API error:", err);
      return NextResponse.json({ error: `Gemini error: ${res.status}` }, { status: 500 });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Nepodařilo se získat odpověď.";
    return NextResponse.json({ text });
  } catch (err) {
    console.error("Route error:", err);
    return NextResponse.json({ error: "Interní chyba serveru." }, { status: 500 });
  }
}
