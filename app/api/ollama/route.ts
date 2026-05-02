export async function POST(req: Request) {
  const body = await req.json();
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: body.model ?? 'qwen2.5:7b', prompt: body.prompt, stream: false }),
    });
    const data = await response.json();
    return Response.json({ response: data.response });
  } catch {
    return Response.json({ error: 'Ollama offline' }, { status: 503 });
  }
}

export async function GET() {
  try {
    const res = await fetch('http://localhost:11434/api/tags');
    const data = await res.json();
    return Response.json(data);
  } catch {
    return Response.json({ error: 'Ollama offline' }, { status: 503 });
  }
}
