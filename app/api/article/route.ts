import { NextRequest, NextResponse } from "next/server";

function buildFallbackArticle(topic: string, format?: string) {
  const cleanTopic = topic || "Building Event-Driven Azure ADF & Delta Lake Pipelines";
  return `# ${cleanTopic}

**Subheading: Enterprise Integration Architecture & Real-Time Data Streaming**

*By Ivo Doležal · Senior Data Engineer & AI Specialist*

---

### Executive Summary & Problem Statement
In enterprise cloud environments, legacy ETL batch processes often fail to meet real-time operational demands. Migrating to an event-driven architecture with Azure Data Factory, Event Hubs, and Databricks PySpark enables low-latency streaming and automated ingestion into Medallion Lakehouses (Bronze → Silver → Gold).

### Key Architectural Pillars
1. **Event Ingestion Layer**: Azure Event Hubs / Service Bus for high-throughput stream buffering with zero event loss.
2. **Transform & Storage Layer**: Databricks PySpark Structured Streaming with Delta Lake ACID transactions and Z-Ordering.
3. **AI Metadata & Triaging**: Google Gemini 2.0 Flash REST endpoints for automated payload classification and real-time alerts.

### PySpark Implementation Code Snippet

\`\`\`python
# Real-Time Event Stream Processing into Silver Delta Lake
from pyspark.sql.functions import from_json, col, current_timestamp

connection_string = "Endpoint=sb://aivos-hub.servicebus.windows.net/..."
eh_config = {
    'eventhubs.connectionString': sc._jvm.org.apache.spark.eventhubs.EventHubsUtils.encrypt(connection_string)
}

# 1. Read Stream from Azure Event Hub
stream_df = spark.readStream \\
    .format("eventhubs") \\
    .options(**eh_config) \\
    .load()

# 2. Extract JSON Payload & Append to Silver Table
query = stream_df \\
    .select(col("body").cast("string").alias("payload"), current_timestamp().alias("ingested_at")) \\
    .writeStream \\
    .format("delta") \\
    .option("checkpointLocation", "/mnt/checkpoints/silver_events") \\
    .outputMode("append") \\
    .table("silver_events")
\`\`\`

### Knowledge Base Cross-Reference
- **Azure ADF & Integration**: Decouple producer triggers from downstream analytical loads.
- **Delta Lake Optimization**: Run \`OPTIMIZE silver_events ZORDER BY (ingested_at)\` for fast temporal queries.
- **Local Fallback Readiness**: Integrate with Ollama (\`qwen2.5:7b\`) for offline private memory chat.

### Best Practices & Takeaways
- Use **partition keys** in Event Hubs matching PySpark executor core availability.
- Implement **schema evolution** in Delta Lake using \`.option("mergeSchema", "true")\`.

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
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.warn("Gemini API call returned non-200 status, using structured fallback draft.");
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
    return NextResponse.json({ article: buildFallbackArticle("Azure & AI Automation Pipelines"), isFallback: true });
  }
}
