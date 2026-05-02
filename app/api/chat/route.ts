import { NextRequest } from 'next/server'

// POST /api/chat
// Body: { messages: [{role, content}], model?, sessionId? }
// Returns: streaming text/event-stream (SSE)
export async function POST(req: NextRequest) {
    const body = await req.json()
    const { messages, model = 'qwen2.5:7b', sessionId } = body

    // System prompt – AIVOS identity
    const systemMessage = {
          role: 'system',
          content: `Jsi AIVOS – osobní AI asistent Ivo Doležala. 
      Jsi stručný, věcný, mluvíš česky pokud není požádáno jinak.
      Znáš jeho kontext: Junior Data Engineer, pracuje s Azure, Databricks, Microsoft Fabric, SQL, Python.
      Aktuálně buduje AIVOS – Personal AI OS (Next.js + Ollama + Notion).
      Odpovídej jako chytrý kolega, ne jako formální asistent.
      Používej evropské pomlčky (–) ne americké (—).`
        }

    const allMessages = [systemMessage, ...messages]

    try {
          const ollamaRes = await fetch('http://localhost:11434/api/chat', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                            model,
                            messages: allMessages,
                            stream: true,
                          }),
                })

          if (!ollamaRes.ok) {
                  return Response.json({ error: 'Ollama error: ' + ollamaRes.status }, { status: 502 })
                }

          // Pass through the streaming response as SSE
          const encoder = new TextEncoder()
          const stream = new ReadableStream({
                  async start(controller) {
                            const reader = ollamaRes.body!.getReader()
                            const decoder = new TextDecoder()
                            try {
                                        while (true) {
                                                      const { done, value } = await reader.read()
                                                      if (done) break
                                                      const chunk = decoder.decode(value, { stream: true })
                                                      // Each line from Ollama is a JSON object
                                                      const lines = chunk.split('\n').filter(l => l.trim())
                                                      for (const line of lines) {
                                                                      try {
                                                                                        const json = JSON.parse(line)
                                                                                        if (json.message?.content) {
                                                                                                            // SSE format: data: <content>\n\n
                                                                                                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: json.message.content, done: json.done })}\n\n`))
                                                                                                          }
                                                                                        if (json.done) {
                                                                                                            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                                                                                                          }
                                                                                      } catch { /* skip malformed lines */ }
                                                                    }
                                                    }
                                      } finally {
                                        controller.close()
                                      }
                          }
                })

          return new Response(stream, {
                  headers: {
                            'Content-Type': 'text/event-stream',
                            'Cache-Control': 'no-cache',
                            'Connection': 'keep-alive',
                            'X-Session-Id': sessionId ?? '',
                          }
                })
        } catch (e) {
          return Response.json({ error: 'Ollama offline nebo nedostupný' }, { status: 503 })
        }
  }
