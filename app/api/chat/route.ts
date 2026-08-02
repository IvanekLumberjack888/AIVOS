import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { messages, videoContext } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY || process.env.IVCA_GEMINI_API;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY / IVCA_GEMINI_API not set" }, { status: 500 });
  }

  const systemPrompt = `Jsi AI asistent pro Iva – Junior Data Engineera (Azure stack, INTJ, AI Automations).
Analyzuješ YouTube video a odpovídáš na dotazy k jeho obsahu.
Mluv česky, technické termTermíny anglicky. Buď konkrétní a praktický. Bez omáčky.

Kontext videa:
Název: ${videoContext.title}
Kanál: ${videoContext.channel}
Shrnutí: ${videoContext.summary}
Klíčové body: ${(videoContext.key_points || []).join(", ")}
Akční krok: ${videoContext.action}
Tagy: ${videoContext.tags}

Pomáhej Ivovi pochopit jak použít obsah videa v jeho situaci:
- práce s Azure ADF, Databricks, Service Bus, Event Hub
- učení se data engineering a AI automacím
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

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
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

    // Transform SSE stream from Gemini into client stream
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = decoder.decode(chunk);
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();
            if (dataStr === "[DONE]") continue;
            try {
              const data = JSON.parse(dataStr);
              const chunkText = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (chunkText) {
                controller.enqueue(encoder.encode(chunkText));
              }
            } catch {
              // ignore partial json
            }
          }
        }
      },
    });

    return new Response(res.body?.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
