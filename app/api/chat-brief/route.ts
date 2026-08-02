import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages, videoContext } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY || process.env.IVCA_GEMINI_API;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY / IVCA_GEMINI_API is not set." }, { status: 500 });
  }

  const systemPrompt = `You are an AI assistant for Ivo – Data Engineer & AI Specialist (Azure stack, AI Automations).
Analyze the YouTube video and answer questions about its content.
Respond in clear, professional English. Be specific, concise, and practical. No fluff.

Video Context:
Title: ${videoContext.title}
Channel: ${videoContext.channel}
Summary: ${videoContext.summary || "(unavailable)"}
Key Points: ${(videoContext.key_points || []).join(", ") || "(unavailable)"}
Tags: ${videoContext.tags || ""}

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
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Could not retrieve response.";
      return NextResponse.json({ text });
    } catch {
      continue;
    }
  }

  return NextResponse.json({ error: "Gemini API is currently overloaded. Please try again shortly." }, { status: 429 });
}
