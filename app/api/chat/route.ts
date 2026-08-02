import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { messages, videoContext } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY || process.env.IVCA_GEMINI_API;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY / IVCA_GEMINI_API not set" }, { status: 500 });
  }

  const systemPrompt = `You are an AI assistant for Ivo – Data Engineer & AI Specialist (Azure stack, AI Automations).
Analyze the YouTube video and answer questions about its technical content.
Respond in clear, professional English. Be specific, concise, and practical. No fluff.

Video Context:
Title: ${videoContext.title}
Channel: ${videoContext.channel}
Summary: ${videoContext.summary}
Key Points: ${(videoContext.key_points || []).join(", ")}
Action Item: ${videoContext.action}
Tags: ${videoContext.tags}

Help Ivo apply this video's technical content in his context:
- Azure ADF, Databricks, Service Bus, Event Hub integration
- Data engineering & AI automation workflows
- Building AIVOS Personal AI Operating System
- Cloud certifications & self-development (AZ-900, etc)`;

  const geminiMessages = [
    { role: "user", parts: [{ text: systemPrompt + "\n\nGreet the user and ask what they want to know about this video." }] },
    { role: "model", parts: [{ text: `Hi! I have the video "${videoContext.title}" by ${videoContext.channel}. What would you like to explore?` }] },
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
