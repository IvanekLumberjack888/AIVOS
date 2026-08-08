import { NextRequest, NextResponse } from "next/server";

function buildFallbackArticle(topic: string, format?: string) {
  const cleanTopic = topic?.trim() || "Building Enterprise IT Integration & Automation Pipelines";
  const lower = cleanTopic.toLowerCase();

  let categoryTitle = "Enterprise IT Integration & Automation Architecture";
  let overviewText = `In modern enterprise environments, connecting software systems, APIs, and cloud services requires reliable integration patterns. This guide provides a step-by-step technical blueprint for **${cleanTopic}**.`;
  let codeSnippet = `# IT Integration & Automation Event Workflow
import requests
import json

def process_integration_event(event_payload):
    """Automated integration trigger for: ${cleanTopic}"""
    endpoint = "https://api.enterprise.internal/v1/integration/events"
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    
    payload = {
        "event_name": "${cleanTopic}",
        "status": "ACKNOWLEDGED",
        "details": event_payload
    }
    
    res = requests.post(endpoint, headers=headers, json=payload)
    return res.status_code == 200
`;

  let pillars = [
    "**1. Event-Driven Triggers & Webhooks**: Decoupled asynchronous event ingestion with automatic retry logic.",
    "**2. Schema Normalization & Payload Validation**: Standardizing payload data models across API boundaries.",
    "**3. Telemetry Monitoring & Error Handling**: Real-time pipeline health checks, dead-letter queues, and operational alerts."
  ];

  let takeaways = [
    "Always use token-based authentication and secure key vaults for API credentials.",
    "Implement structured logging to trace message flow across microservices."
  ];

  if (lower.includes("databricks") || lower.includes("spark") || lower.includes("delta")) {
    categoryTitle = "Databricks PySpark & Delta Lake Integration";
    overviewText = `Integrating Azure Databricks into enterprise automation pipelines requires robust job acknowledgment, Delta Lake ACID transactions, and optimized cluster management for **${cleanTopic}**.`;
    codeSnippet = `# Databricks PySpark Job Acknowledgment & Delta Stream
from pyspark.sql.functions import col, current_timestamp

# 1. Read incoming stream payload from Delta Lake
df = spark.readStream.format("delta").table("bronze_events")

# 2. Process job acknowledgment and append to Silver Lakehouse
query = df.filter(col("status") == "ACKNOWLEDGED") \\
    .withColumn("processed_at", current_timestamp()) \\
    .writeStream \\
    .format("delta") \\
    .outputMode("append") \\
    .option("checkpointLocation", "/mnt/checkpoints/databricks_ack") \\
    .table("silver_acknowledged_events")
`;
    pillars = [
      "**1. Databricks REST API & Job Acknowledgment**: Triggering and verifying PySpark notebooks via REST endpoints.",
      "**2. Delta Lake Structured Streaming**: ACID transactions, schema enforcement, and time-travel replay.",
      "**3. Z-Ordering & Partitioning**: Optimizing file layouts (\`OPTIMIZE table ZORDER BY (col)\`) for fast scans."
    ];
    takeaways = [
      "Use structured streaming checkpoints to ensure zero data loss during cluster restarts.",
      "Emit callback webhooks to notify upstream integration platforms when jobs finish."
    ];
  } else if (lower.includes("adf") || lower.includes("azure") || lower.includes("factory") || lower.includes("pipeline")) {
    categoryTitle = "Azure Data Factory & Enterprise Cloud Integration";
    overviewText = `Automating Azure Data Factory (ADF) pipelines with REST APIs, Managed Identities, and event triggers for **${cleanTopic}**.`;
    codeSnippet = `# Azure ADF Pipeline Execution via Management REST API
import requests
from azure.identity import DefaultAzureCredential

credential = DefaultAzureCredential()
token = credential.get_token("https://management.azure.com/.default").token

url = "https://management.azure.com/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.DataFactory/factories/{adf}/pipelines/{pipeline}/createRun?api-version=2018-06-01"
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

res = requests.post(url, headers=headers, json={"parameters": {"topic": "${cleanTopic}"}})
print("ADF Pipeline Triggered Status:", res.status_code)
`;
    pillars = [
      "**1. Dynamic Expressions & Parameters**: Passing runtime parameters to ADF Web Activities.",
      "**2. Managed Identity & Key Vault**: Zero-secret authentication across Azure resources.",
      "**3. Custom Webhook & Event Grid Triggers**: Instant pipeline execution on event publication."
    ];
    takeaways = [
      "Use Azure Service Bus dead-letter queues for failed pipeline payloads.",
      "Parameterize ADF linked services to reuse compute runtimes across environments."
    ];
  } else if (lower.includes("ai") || lower.includes("gemini") || lower.includes("ollama") || lower.includes("llm")) {
    categoryTitle = "AI Automation & LLM Integration Architecture";
    overviewText = `Combining Gemini 2.0 Flash REST APIs and local Ollama models for automated text enrichment, triaging, and Q&A workflows in **${cleanTopic}**.`;
    codeSnippet = `# Gemini 2.0 Flash REST Integration Script
import requests

def analyze_topic_with_ai(prompt_text):
    api_key = "YOUR_GEMINI_API_KEY"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    
    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt_text}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 1024}
    }
    
    res = requests.post(url, json=payload)
    return res.json()["candidates"][0]["content"]["parts"][0]["text"]
`;
    pillars = [
      "**1. Low-Latency REST Ingestion**: Streaming Gemini 2.0 Flash responses via Server-Sent Events (SSE).",
      "**2. Privacy-First Local Fallback**: Seamless fallback to Ollama (\`qwen2.5:7b\`) when offline.",
      "**3. RAG Knowledge Base Integration**: Cross-referencing internal documentation and wiki data."
    ];
    takeaways = [
      "Constrain LLM outputs using system instructions and strict JSON schemas.",
      "Cache embeddings to minimize token usage and latency."
    ];
  }

  return `# ${cleanTopic}

**Subheading: ${categoryTitle}**

*By Ivo Doležal · IT Integration and Automation Specialist*

---

### Executive Summary & Problem Statement
${overviewText}

### Key Architectural Pillars
${pillars.join("\n\n")}

### Technical Implementation Code Snippet

\`\`\`python
${codeSnippet}\`\`\`

### Knowledge Base & Best Practices
${takeaways.map(t => `- ${t}`).join("\n")}

---
*Generated via AIVOS Content Studio · Platform Target: ${format || "Medium.com"}*`;
}

export async function POST(req: NextRequest) {
  try {
    const { topic, format } = await req.json();

    const rawKey = process.env.GEMINI_API_KEY || process.env.IVCA_GEMINI_API || "";
    const apiKey = rawKey.replace(/^["']|["']$/g, "").trim();

    if (!apiKey) {
      return NextResponse.json({ article: buildFallbackArticle(topic, format), isFallback: true });
    }

    const systemPrompt = `You are an expert technical content creator and IT Integration and Automation Specialist writing high-converting tech articles for Medium.com, Substack, and Notion templates.

Create a comprehensive, highly engaging article draft for the following topic:
Topic: "${topic}"
Target Platform: ${format || "Medium.com"}

Structure the response with:
1. Catchy Title & Subtitle
2. Introduction (Hook & Problem Statement)
3. Core Technical Architecture & Code Snippets (Azure, PySpark, SQL, AI/LLM, Next.js, Webhooks)
4. Key Takeaways & Best Practices
5. Call to Action (Link to Notion templates / GitHub repo)`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.warn("Gemini API call returned non-200 status, using topic-aware fallback draft.");
      return NextResponse.json({ article: buildFallbackArticle(topic, format), isFallback: true });
    }

    const data = await res.json();
    const articleText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!articleText) {
      return NextResponse.json({ article: buildFallbackArticle(topic, format), isFallback: true });
    }

    return NextResponse.json({ article: articleText });
  } catch (err: any) {
    console.error("Error generating article:", err);
    return NextResponse.json({ article: buildFallbackArticle("Enterprise IT Integration and Automation"), isFallback: true });
  }
}
