import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { topic, format } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY || process.env.IVCA_GEMINI_API;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY / IVCA_GEMINI_API not set" }, { status: 500 });
    }

    const systemPrompt = `You are an expert technical content creator and Senior Data Engineer writing high-converting tech articles for Medium.com, Substack, and Notion templates.

Create a comprehensive, highly engaging article draft for the following topic:
Topic: "${topic}"
Target Platform: ${format || "Medium.com"}

Structure the response with:
1. Catchy Title & Subtitle
2. Introduction (Hook & Problem Statement)
3. Core Technical Architecture & Code Snippets (Azure, PySpark, SQL, AI/LLM, Next.js)
4. Key Takeaways & Best Practices
5. Call to Action (Link to Notion templates / GitHub repo)`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }

    const data = await res.json();
    const articleText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not generate article.";

    return NextResponse.json({ article: articleText });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
