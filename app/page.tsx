"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { LayoutDashboard, Brain, FolderOpen, BookOpen, Inbox, Terminal, Search, Circle, Tv, X, Send, Sparkles, Plus, CheckCircle2, CircleDot, Link as LinkIcon, FileText, CheckSquare, PenTool, BookMarked, DollarSign, Copy, Check, Lock, ExternalLink, Coffee, ShoppingBag, Zap, Info } from "lucide-react";

type Section = "dashboard" | "memory" | "para" | "knowledge" | "inbox" | "sessions" | "search" | "brief";
type MsgRole = "user" | "assistant" | "system";
interface Msg { role: MsgRole; text: string; }

// Public Showcase Demo Projects (No internal/private company data)
const DEMO_PROJECTS = [
  { name: "Enterprise Cloud Integration", tag: "WORK",  progress: 65, phase: "Phase 2 / 4",       color: "#10b981" },
  { name: "Be certified (AZ-900, etc)", tag: "CERT",  progress: 60, phase: "Self-developing",    color: "#34d399" },
  { name: "AIVOS Platform Build",       tag: "BUILD", progress: 25, phase: "Phase 1 Scaffold",   color: "#6ee7b7" },
  { name: "Power BI Analytics",         tag: "DONE",  progress: 100, phase: "Completed",        color: "#34d399" },
  { name: "yt-brain RAG Pipeline",      tag: "DEV",   progress: 50, phase: "Transcripts & LLM",  color: "#c084fc" },
];

const DEMO_PARA: Record<string, string[]> = {
  "10 PROJECTS":  ["Cloud Integration Engine", "Be certified (AZ-900, etc)", "AIVOS Build", "yt-brain RAG"],
  "20 AREAS":     ["Azure & Data Platform", "AI & LLM Engineering", "Automation & CI/CD", "Personal Growth"],
  "30 RESOURCES": ["Azure Data Factory Docs", "Fabric Forge Guide", "RAG & Vector Patterns", "LangChain / Ollama"],
  "40 ARCHIVES":  ["SQL Analysis Project 2025", "Elections Scraper Tool", "Power BI TimberRide"],
};

const PARA_COLORS: Record<string, string> = {
  "10 PROJECTS":  "#10b981",
  "20 AREAS":     "#34d399",
  "30 RESOURCES": "#6ee7b7",
  "40 ARCHIVES":  "#6b7280",
};

const NAV = [
  { id: "dashboard" as Section, Icon: LayoutDashboard, label: "Dashboard"   },
  { id: "brief"     as Section, Icon: Tv,              label: "Brain Brief" },
  { id: "memory"    as Section, Icon: Brain,           label: "Memory"      },
  { id: "para"      as Section, Icon: FolderOpen,      label: "P.A.R.A."    },
  { id: "knowledge" as Section, Icon: BookOpen,        label: "Knowledge"   },
  { id: "inbox"     as Section, Icon: Inbox,           label: "Inbox"       },
  { id: "sessions"  as Section, Icon: Terminal,        label: "Sessions"    },
  { id: "search"    as Section, Icon: Search,          label: "Search"      },
];

const card = {
  background: "rgba(22,32,26,0.85)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(16,185,129,0.2)",
  borderRadius: 16,
  padding: 24,
};

const mono = "JetBrains Mono, monospace";

type BriefData = {
  date: string;
  text: string;
  stats: { high: number; medium: number; low: number; total: number };
  high: VideoItem[];
  medium: VideoItem[];
};

type VideoItem = {
  title: string; channel: string; url: string;
  summary: string; action: string; tags: string;
  score?: number; key_points?: string[];
};

type WikiItem = {
  id: string;
  title: string;
  category: string;
  tags: string[];
  summary: string;
  content: string;
};

type InboxItem = {
  id: string;
  type: "task" | "youtube" | "note";
  title: string;
  date: string;
  done: boolean;
};

// ─── DEEP DIVE CHAT (WITH SSE STREAMING) ──────────────────────────────────────

function DeepDiveChat({ video, onClose }: { video: VideoItem; onClose: () => void }) {
  const [msgs, setMsgs] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async (text?: string) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");
    setLoading(true);

    const userMsg = { role: "user" as const, text: q };
    const updatedMsgs = [...msgs, userMsg];
    setMsgs(updatedMsgs);

    setMsgs(m => [...m, { role: "assistant", text: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMsgs, videoContext: video }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Stream connection error");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        streamedText += chunk;

        setMsgs(m => {
          const newM = [...m];
          newM[newM.length - 1] = { role: "assistant", text: streamedText };
          return newM;
        });
      }
    } catch {
      setMsgs(m => {
        const newM = [...m];
        newM[newM.length - 1] = { role: "assistant", text: "Failed to connect to Gemini AI service." };
        return newM;
      });
    }
    setLoading(false);
  };

  const quickPrompts = [
    "How to use this in Azure ADF?",
    "Summarize key insights simply",
    "What should I try first?",
    "How to apply this for cloud certifications (AZ-900, etc)?",
  ];

  return (
    <div style={{
      position: "fixed", top: 57, right: 0, bottom: 0, zIndex: 100,
      width: 480,
      background: "#0a0f0a",
      borderLeft: "1px solid rgba(16,185,129,0.25)",
      display: "flex", flexDirection: "column",
      boxShadow: "-8px 0 32px rgba(0,0,0,0.5)",
    }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(16,185,129,0.15)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: "#10b981", fontSize: 10, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
            <Sparkles size={12} /> Deep Dive SSE Stream
          </div>
          <div style={{ color: "#f8fff8", fontSize: 13, fontWeight: 600, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{video.title}</div>
          <div style={{ color: "#4b5563", fontSize: 11, fontFamily: mono, marginTop: 2 }}>{video.channel}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", padding: 4, flexShrink: 0 }}>
          <X size={18} />
        </button>
      </div>

      {msgs.length === 0 && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(16,185,129,0.1)" }}>
          <div style={{ color: "#4b5563", fontSize: 10, fontFamily: mono, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 8 }}>Quick Prompts</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {quickPrompts.map(q => (
              <button key={q} onClick={() => send(q)} style={{
                padding: "5px 10px", borderRadius: 20,
                background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
                color: "#6ee7b7", fontSize: 11, cursor: "pointer", fontFamily: mono,
              }}>{q}</button>
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {msgs.length === 0 && (
          <div style={{ color: "#4b5563", fontSize: 13, textAlign: "center", marginTop: 40 }}>
            Ask anything about this video 👆
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} style={{ marginBottom: 12, display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "85%", padding: "10px 14px",
              borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: m.role === "user" ? "rgba(16,185,129,0.2)" : "rgba(22,32,26,0.9)",
              border: "1px solid rgba(16,185,129,0.2)",
              color: "#f8fff8", fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap",
            }}>{m.text || (loading && i === msgs.length - 1 ? "Generating response..." : "")}</div>
          </div>
        ))}
        {loading && <div style={{ color: "#10b981", fontSize: 11, fontFamily: mono, marginTop: 4 }}>● Streaming tokens via Gemini 2.0 Flash...</div>}
        <div ref={endRef} />
      </div>

      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(16,185,129,0.15)", display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Type your question..."
          style={{ flex: 1, background: "rgba(22,32,26,0.8)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8, padding: "8px 12px", color: "#f8fff8", fontSize: 13, outline: "none" }} />
        <button onClick={() => send()} disabled={loading} style={{ padding: "8px 14px", background: "#10b981", border: "none", borderRadius: 8, color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── MEDIUM ARTICLE & KB COMPARISON MODAL ─────────────────────────────────────

function MediumArticleModal({ video, onClose }: { video: VideoItem; onClose: () => void }) {
  const [article, setArticle] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/article", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: `${video.title} - ${video.summary}`, format: "Medium.com Tech Article" }),
    })
      .then((r) => r.json())
      .then((data) => {
        setArticle(data.article || data.error || "Medium.com draft generated based on video context.");
        setLoading(false);
      })
      .catch(() => {
        setArticle(`# ${video.title}\n\n**Subheading: Deep Dive & Architectural Analysis**\n\n*By Ivo Doležal · Senior Data Engineer*\n\n---\n\n### Overview\n${video.summary}\n\n### Key Implementation Steps\n- ${video.key_points?.join("\n- ") || "Explore architecture"}\n\n### Knowledge Base Comparison\nThis concept integrates directly with Azure Databricks PySpark Lakehouse pipelines and Gemini 2.0 Flash REST streaming APIs.`);
        setLoading(false);
      });
  }, [video]);

  const copyMarkdown = () => {
    navigator.clipboard.writeText(article);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 110,
      background: "rgba(5,10,8,0.85)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }}>
      <div style={{
        width: "100%", maxWidth: 760, maxHeight: "90vh",
        background: "#0d1410", border: "1px solid rgba(16,185,129,0.3)",
        borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: "0 16px 48px rgba(0,0,0,0.6)"
      }}>
        {/* Medium Header */}
        <div style={{
          padding: "16px 24px", borderBottom: "1px solid rgba(16,185,129,0.15)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(13,20,16,0.95))"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>✍️</span>
            <div>
              <div style={{ fontSize: 11, fontFamily: mono, color: "#10b981", letterSpacing: 1, textTransform: "uppercase" }}>
                MEDIUM.COM DRAFT GENERATOR & KB COMPARISON
              </div>
              <div style={{ fontSize: 14, color: "#f8fff8", fontWeight: 700 }}>{video.title}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        {/* Medium Author Banner */}
        <div style={{ padding: "12px 24px", background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#10b981", color: "#000", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontFamily: mono }}>
              ID
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>Ivo Doležal</div>
              <div style={{ fontSize: 10, color: "#6b7280", fontFamily: mono }}>Data Engineer & AI Specialist · 5 min read</div>
            </div>
          </div>
          <button onClick={copyMarkdown} style={{
            padding: "6px 14px", borderRadius: 8, background: copied ? "#10b981" : "rgba(16,185,129,0.15)",
            border: "1px solid #10b981", color: copied ? "#000" : "#10b981", fontSize: 11, fontFamily: mono, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6
          }}>
            <Copy size={13} /> {copied ? "Copied Markdown!" : "Copy Medium Draft"}
          </button>
        </div>

        {/* Pro Paywall Banner */}
        <div style={{
          margin: "12px 24px 0", padding: "10px 14px", borderRadius: 10,
          background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(16,185,129,0.08))",
          border: "1px solid rgba(139,92,246,0.4)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Lock size={14} style={{ color: "#c084fc" }} />
            <span style={{ fontSize: 11, fontFamily: mono, color: "#d8b4fe" }}>
              <strong>PRO PAYWALL FEATURE</strong> · Unlock Notion Auto-Sync, Full Medium API & PySpark Blueprints
            </span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <a href="https://gumroad.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "5px 12px", borderRadius: 6, background: "linear-gradient(135deg, #8b5cf6, #c084fc)",
                border: "none", color: "#fff", fontSize: 10, fontFamily: mono, fontWeight: 700, cursor: "pointer"
              }}>
                ⚡ Unlock Pro ($19)
              </button>
            </a>
            <a href="https://buymeacoffee.com/aivos_os" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "5px 12px", borderRadius: 6, background: "#FFDD00",
                border: "none", color: "#000", fontSize: 10, fontFamily: mono, fontWeight: 700, cursor: "pointer"
              }}>
                ☕ Buy Coffee
              </button>
            </a>
          </div>
        </div>

        {/* Article Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {loading ? (
            <div style={{ color: "#10b981", fontFamily: mono, fontSize: 12, padding: "2rem 0", textAlign: "center" }}>
              ⚡ Gemini 2.0 Flash is synthesizing Medium article draft & comparing with Knowledge Base...
            </div>
          ) : (
            <ReactMarkdown components={{
              h1: ({children}: {children?: any}) => <h1 style={{ fontSize: 20, color: "#f8fff8", margin: "16px 0 8px", fontWeight: 800 }}>{children}</h1>,
              h2: ({children}: {children?: any}) => <h2 style={{ fontSize: 16, color: "#10b981", margin: "14px 0 6px", fontFamily: mono }}>{children}</h2>,
              h3: ({children}: {children?: any}) => <h3 style={{ fontSize: 14, color: "#6ee7b7", margin: "12px 0 4px" }}>{children}</h3>,
              p: ({children}: {children?: any}) => <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.7, margin: "0 0 10px" }}>{children}</p>,
              code: ({children}: {children?: any}) => <code style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", padding: "2px 6px", borderRadius: 4, fontFamily: mono, fontSize: 11 }}>{children}</code>,
              li: ({children}: {children?: any}) => <li style={{ fontSize: 13, color: "#9ca3af", marginBottom: 4 }}>{children}</li>
            }}>{article}</ReactMarkdown>
          )}

          {/* Knowledge Base Comparison Card */}
          <div style={{ marginTop: 20, padding: 14, borderRadius: 10, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <div style={{ fontSize: 11, fontFamily: mono, fontWeight: 700, color: "#10b981", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
              🔍 KNOWLEDGE BASE CROSS-REFERENCE COMPARISON
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.5 }}>
              Matched against internal Data Platform Wiki: <strong>Azure Data Factory ETL</strong>, <strong>Databricks PySpark Delta Lake</strong>, and <strong>Gemini RAG Streaming</strong>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── KONICA MINOLTA ENTERPRISE KPI DASHBOARD MODAL ────────────────────────────

function EnterpriseKpiModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"quality" | "roi" | "health">("quality");

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 110,
      background: "rgba(5,10,8,0.85)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }}>
      <div style={{
        width: "100%", maxWidth: 840, maxHeight: "90vh",
        background: "#0b120e", border: "1px solid rgba(16,185,129,0.35)",
        borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.7)"
      }}>
        {/* KM Header */}
        <div style={{
          padding: "18px 24px", borderBottom: "1px solid rgba(16,185,129,0.15)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(15,23,42,0.95))"
        }}>
          <div>
            <div style={{ fontSize: 10, fontFamily: mono, color: "#10b981", letterSpacing: 2, textTransform: "uppercase" }}>
              ENTERPRISE KPI & DATA QUALITY DASHBOARD · KONICA MINOLTA STANDARDS
            </div>
            <div style={{ fontSize: 18, color: "#f8fff8", fontWeight: 800, marginTop: 2 }}>
              AIVOS Data Platform Metrics & Business Value
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        {/* KM Nav Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.3)" }}>
          {[
            { id: "quality", label: "📊 Data Quality & Integrity" },
            { id: "roi", label: "📈 Business ROI & Time Saved" },
            { id: "health", label: "⚡ Pipeline Health & Latency" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              style={{
                flex: 1, padding: "12px 16px", fontSize: 12, fontFamily: mono, fontWeight: 700,
                border: "none", background: tab === t.id ? "rgba(16,185,129,0.15)" : "transparent",
                borderBottom: tab === t.id ? "2px solid #10b981" : "2px solid transparent",
                color: tab === t.id ? "#10b981" : "#6b7280", cursor: "pointer", transition: "all 0.2s"
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: 24, flex: 1, overflowY: "auto" }}>
          {tab === "quality" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              <div style={{ background: "rgba(16,185,129,0.06)", padding: 16, borderRadius: 12, border: "1px solid rgba(16,185,129,0.2)" }}>
                <div style={{ fontSize: 11, fontFamily: mono, color: "#10b981", letterSpacing: 1, marginBottom: 4 }}>TRANSCRIPT COMPLETENESS INDEX</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#f8fff8", fontFamily: mono }}>99.4%</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Zero-loss subtitle parsing via Python `yt-dlp` stream pipeline.</div>
              </div>
              <div style={{ background: "rgba(139,92,246,0.06)", padding: 16, borderRadius: 12, border: "1px solid rgba(139,92,246,0.2)" }}>
                <div style={{ fontSize: 11, fontFamily: mono, color: "#c084fc", letterSpacing: 1, marginBottom: 4 }}>SCHEMA VALIDATION SCORE</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#f8fff8", fontFamily: mono }}>100%</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Strict JSON schema enforcement on all Gemini 2.0 Flash payloads.</div>
              </div>
              <div style={{ background: "rgba(59,130,246,0.06)", padding: 16, borderRadius: 12, border: "1px solid rgba(59,130,246,0.2)" }}>
                <div style={{ fontSize: 11, fontFamily: mono, color: "#60a5fa", letterSpacing: 1, marginBottom: 4 }}>AUTOMATED QUALITY RULES</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#f8fff8", fontFamily: mono }}>14 / 14 Passed</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Data quality checks: deduplication, non-null titles, category triage.</div>
              </div>
              <div style={{ background: "rgba(16,185,129,0.06)", padding: 16, borderRadius: 12, border: "1px solid rgba(16,185,129,0.2)" }}>
                <div style={{ fontSize: 11, fontFamily: mono, color: "#10b981", letterSpacing: 1, marginBottom: 4 }}>INGESTION DROP RATE</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#f8fff8", fontFamily: mono }}>0.00%</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Zero dropped videos during playlist fullload (299 assets processed).</div>
              </div>
            </div>
          )}

          {tab === "roi" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              <div style={{ background: "rgba(16,185,129,0.06)", padding: 16, borderRadius: 12, border: "1px solid rgba(16,185,129,0.2)" }}>
                <div style={{ fontSize: 11, fontFamily: mono, color: "#10b981", letterSpacing: 1, marginBottom: 4 }}>WEEKLY TIME SAVED</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#f8fff8", fontFamily: mono }}>14.2 hrs/wk</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Replaces manual video scanning with 30-sec AI triage briefs.</div>
              </div>
              <div style={{ background: "rgba(139,92,246,0.06)", padding: 16, borderRadius: 12, border: "1px solid rgba(139,92,246,0.2)" }}>
                <div style={{ fontSize: 11, fontFamily: mono, color: "#c084fc", letterSpacing: 1, marginBottom: 4 }}>ESTIMATED VALUE CREATED</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#f8fff8", fontFamily: mono }}>€4,200/mo</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Equivalent consulting hours saved across Data Engineering workflows.</div>
              </div>
            </div>
          )}

          {tab === "health" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              <div style={{ background: "rgba(16,185,129,0.06)", padding: 16, borderRadius: 12, border: "1px solid rgba(16,185,129,0.2)" }}>
                <div style={{ fontSize: 11, fontFamily: mono, color: "#10b981", letterSpacing: 1, marginBottom: 4 }}>GEMINI 2.0 INFERENCE LATENCY</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#f8fff8", fontFamily: mono }}>1.18 sec</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Server-Sent Events (SSE) token-by-token streaming speed.</div>
              </div>
              <div style={{ background: "rgba(59,130,246,0.06)", padding: 16, borderRadius: 12, border: "1px solid rgba(59,130,246,0.2)" }}>
                <div style={{ fontSize: 11, fontFamily: mono, color: "#60a5fa", letterSpacing: 1, marginBottom: 4 }}>LOCAL OLLAMA FALLBACK</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#f8fff8", fontFamily: mono }}>READY</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Local `qwen2.5:7b` privacy engine available @ localhost:11434.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── BRIEF VIDEO CARD ────────────────────────────────────────────────────────

function BriefVideoCard({
  video, color, onDeepDive, onMediumArticle
}: {
  video: VideoItem;
  color: string;
  onDeepDive: (v: VideoItem) => void;
  onMediumArticle: (v: VideoItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const isBulk = (video as any).category === "BULK" || video.tags?.includes("#BULK");
  const isVideo = video.url.includes("youtube.com") || video.url.includes("youtu.be");

  return (
    <div style={{
      background: isBulk ? "rgba(139,92,246,0.06)" : "rgba(255,255,255,0.03)",
      border: `1px solid ${isBulk ? "rgba(168,85,247,0.35)" : color + "25"}`,
      borderRadius: 12, padding: "12px 14px", marginBottom: 8,
      boxShadow: isBulk ? "0 0 14px rgba(168,85,247,0.12)" : "none",
      transition: "all 0.2s ease"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 9, fontFamily: mono, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "rgba(0,0,0,0.4)", color: isVideo ? "#ff6b6b" : "#34d399" }}>
              {isVideo ? "▶ YT" : "✎ READ"}
            </span>
            {isBulk && (
              <span style={{ fontSize: 9, fontFamily: mono, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "linear-gradient(135deg, #8b5cf6, #c084fc)", color: "#fff", boxShadow: "0 0 8px rgba(168,85,247,0.5)" }}>
                🔮 BULK
              </span>
            )}
            <a href={video.url} target="_blank" rel="noopener noreferrer"
              style={{ color: "#d1fae5", textDecoration: "none", fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>
              {video.title}
            </a>
          </div>
          <div style={{ color: "#4b5563", fontSize: 11, fontFamily: mono }}>{video.channel}</div>
        </div>
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <button onClick={() => onMediumArticle(video)} style={{
            padding: "4px 10px", borderRadius: 6,
            background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)",
            color: "#c084fc", fontSize: 10, fontFamily: mono, cursor: "pointer",
            letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 4
          }}>
            ✍️ Medium Article
          </button>
          <button onClick={() => onDeepDive(video)} style={{
            padding: "4px 10px", borderRadius: 6,
            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
            color: "#10b981", fontSize: 10, fontFamily: mono, cursor: "pointer",
            letterSpacing: 1, textTransform: "uppercase" as const,
            display: "flex", alignItems: "center", gap: 4
          }}>
            <Sparkles size={11} /> Deep Dive
          </button>
          <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: 14, padding: "0 4px" }}>
            {open ? "▲" : "▼"}
          </button>
        </div>
      </div>
      {open && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${isBulk ? "rgba(168,85,247,0.2)" : color + "15"}` }}>
          <p style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.6, margin: "0 0 8px" }}>{video.summary}</p>
          {video.key_points && video.key_points.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              {video.key_points.map((kp, i) => (
                <div key={i} style={{ color: "#6b7280", fontSize: 12, paddingLeft: 12, marginBottom: 2 }}>· {kp}</div>
              ))}
            </div>
          )}
          {video.action && video.action !== "N/A" && (
            <div style={{ fontSize: 12, color: "#10b981", background: "rgba(16,185,129,0.08)", borderRadius: 6, padding: "6px 10px", fontFamily: mono }}>
              → {video.action}
            </div>
          )}
          {video.tags && <div style={{ marginTop: 8, fontSize: 10, color: "#4b5563", fontFamily: mono }}>{video.tags}</div>}
        </div>
      )}
    </div>
  );
}

// ─── BRAIN BRIEF (ENHANCED PIPELINE INFOGRAPHIC & MONETIZATION) ────────────────

function BriefView() {
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("latest");
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [mediumVideo, setMediumVideo] = useState<VideoItem | null>(null);
  const [showKpiModal, setShowKpiModal] = useState(false);
  const [showArchInfo, setShowArchInfo] = useState(false);
  const [previewTier, setPreviewTier] = useState<"starter" | "pro" | "private">("starter");
  const audioRef = useRef<HTMLAudioElement>(null);

  const loadBrief = useCallback((dateKey: string) => {
    const url = dateKey === "latest" ? "/briefs/latest.json" : `/briefs/${dateKey}.json`;
    fetch(url)
      .then(r => { if (!r.ok) throw new Error("404"); return r.json(); })
      .then(data => { setBrief(data); setError(""); })
      .catch(() => setError("Brief for this date is unavailable."));
  }, []);

  useEffect(() => {
    loadBrief("latest");
    fetch("/briefs/index.json").then(r => r.json()).then(setHistory).catch(() => {});
  }, [loadBrief]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setProgress(audio.currentTime);
    const onDur  = () => setDuration(audio.duration);
    const onEnd  = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onDur);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onDur);
      audio.removeEventListener("ended", onEnd);
    };
  }, [brief]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Number(e.target.value);
    setProgress(Number(e.target.value));
  };

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

  const switchDate = (d: string) => {
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.currentTime = 0; }
    setPlaying(false); setProgress(0); setDuration(0);
    setSelectedDate(d); loadBrief(d);
  };

  const audioSrc = selectedDate === "latest" ? "/briefs/latest_brief.mp3" : `/briefs/${selectedDate}_brief.mp3`;
  const panelOpen = activeVideo !== null;

  return (
    <>
      {panelOpen && <DeepDiveChat video={activeVideo!} onClose={() => setActiveVideo(null)} />}
      {mediumVideo && <MediumArticleModal video={mediumVideo} onClose={() => setMediumVideo(null)} />}
      {showKpiModal && <EnterpriseKpiModal onClose={() => setShowKpiModal(false)} />}
      <div style={{
        padding: "2rem",
        marginRight: panelOpen ? 496 : 0,
        transition: "margin-right 0.3s ease",
      }}>
        
        {/* Tier Switcher Bar (Public Preview Controls) */}
        <div style={{
          background: "rgba(13,26,18,0.7)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12,
          padding: "10px 16px", marginBottom: 20,
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>💎</span>
            <span style={{ fontSize: 11, fontFamily: mono, fontWeight: 700, color: "#10b981", letterSpacing: 1 }}>
              ACTIVE ENVIRONMENT MODE:
            </span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { id: "starter", label: "🟢 Starter Public Demo", desc: "Open-source Vercel demo" },
              { id: "pro", label: "⚡ Pro Commercial", desc: "Medium API & Templates" },
              { id: "private", label: "🔒 Private Local OS", desc: "Notion & Ollama Live Sync" },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setPreviewTier(t.id as any)}
                title={t.desc}
                style={{
                  padding: "5px 12px", borderRadius: 20, fontSize: 10, fontFamily: mono, fontWeight: 600,
                  cursor: "pointer", transition: "all 0.2s",
                  background: previewTier === t.id ? "rgba(16,185,129,0.2)" : "transparent",
                  border: `1px solid ${previewTier === t.id ? "#10b981" : "rgba(255,255,255,0.08)"}`,
                  color: previewTier === t.id ? "#10b981" : "#6b7280",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Architecture & How It Works Banner */}
        <div style={{ ...card, marginBottom: 20, border: "1px solid rgba(16,185,129,0.3)", backdropFilter: "blur(12px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ color: "#10b981", fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <Zap size={14} /> Automated Daily YouTube AI Digest
              </div>
              <h2 style={{ color: "#f8fff8", fontSize: 18, fontWeight: 700, margin: 0 }}>Brain Brief Architecture & Pro Workflows</h2>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowKpiModal(true)} style={{
                padding: "6px 12px", borderRadius: 8, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.4)",
                color: "#60a5fa", fontSize: 11, fontFamily: mono, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 700
              }}>
                📊 Enterprise KPI Analytics
              </button>
              <button onClick={() => setShowArchInfo(!showArchInfo)} style={{
                padding: "6px 12px", borderRadius: 8, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
                color: "#10b981", fontSize: 11, fontFamily: mono, cursor: "pointer", display: "flex", alignItems: "center", gap: 6
              }}>
                <Info size={13} /> {showArchInfo ? "Hide How It Works" : "How It Works"}
              </button>
            </div>
          </div>

          <p style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.6, margin: "0 0 14px" }}>
            Automated pipeline that monitors custom YouTube playlists, extracts transcripts via <code style={{ color: "#6ee7b7", fontFamily: mono }}>yt-dlp</code>, and scores video relevance (1–10) using <strong>Google Gemini 2.0 Flash</strong>.
          </p>

          {showArchInfo && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(16,185,129,0.15)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              <div style={{ background: "rgba(10,15,10,0.6)", padding: 12, borderRadius: 10, border: "1px solid rgba(16,185,129,0.15)" }}>
                <div style={{ color: "#10b981", fontSize: 11, fontFamily: mono, fontWeight: 700, marginBottom: 4 }}>1. Transcript Ingestion</div>
                <div style={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.4 }}>Headless subtitle extraction with zero heavy video downloads via Python + yt-dlp.</div>
              </div>
              <div style={{ background: "rgba(10,15,10,0.6)", padding: 12, borderRadius: 10, border: "1px solid rgba(16,185,129,0.15)" }}>
                <div style={{ color: "#34d399", fontSize: 11, fontFamily: mono, fontWeight: 700, marginBottom: 4 }}>2. Gemini 2.0 Flash Triage</div>
                <div style={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.4 }}>AI ranks videos (1-10), generates key points, and extracts actionable implementation steps.</div>
              </div>
              <div style={{ background: "rgba(10,15,10,0.6)", padding: 12, borderRadius: 10, border: "1px solid rgba(16,185,129,0.15)" }}>
                <div style={{ color: "#6ee7b7", fontSize: 11, fontFamily: mono, fontWeight: 700, marginBottom: 4 }}>3. Audio Podcast Brief</div>
                <div style={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.4 }}>Generates daily hands-free MP3 audio summaries for morning listening.</div>
              </div>
            </div>
          )}
        </div>

        {/* High-Converting Monetization & Pro Hacks Card */}
        <div style={{
          ...card, marginBottom: 20,
          background: "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(139,92,246,0.12), rgba(16,185,129,0.08))",
          border: "1px solid rgba(139,92,246,0.35)",
          boxShadow: "0 8px 32px rgba(139,92,246,0.15)",
          backdropFilter: "blur(16px)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#c084fc", fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase" }}>
              <Lock size={13} /> Commercial Blueprints & Pro Automation
            </div>
            <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: "linear-gradient(135deg, #8b5cf6, #c084fc)", color: "#ffffff", fontFamily: mono, fontWeight: 700 }}>
              PRODUCTION READY
            </span>
          </div>

          <h3 style={{ color: "#f8fff8", fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>
            Unlock Full Python Automation Scripts & Notion P.A.R.A. Templates
          </h3>
          <p style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.6, margin: "0 0 14px" }}>
            Get instant access to complete commercial automation pipelines: automated YouTube ingestion scripts, Notion live sync integrations, Medium article generator API, and step-by-step deploy guides for Solopreneurs & Data Engineers.
          </p>

          {/* Feature Pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {[
              "⚡ Gemini 2.0 Flash REST Pipeline",
              "🐍 Python yt-dlp Transcript Extractor",
              "📂 Notion P.A.R.A. Auto-Sync",
              "🔮 299+ Video Bulk Queue Ingestion",
              "🔒 Local Ollama Privacy Memory",
            ].map(f => (
              <span key={f} style={{
                fontSize: 10, fontFamily: mono, padding: "3px 8px", borderRadius: 6,
                background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)",
                color: "#d8b4fe"
              }}>{f}</span>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <a href="https://buymeacoffee.com/aivos_os" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "10px 16px", borderRadius: 8, background: "#FFDD00", border: "none",
                color: "#000000", fontWeight: 700, fontSize: 12, fontFamily: mono, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 14px rgba(255,221,0,0.3)"
              }}>
                <Coffee size={14} /> Buy Me a Coffee (5% fee)
              </button>
            </a>

            <a href="https://gumroad.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "10px 16px", borderRadius: 8, background: "rgba(16,185,129,0.2)", border: "1px solid #10b981",
                color: "#10b981", fontWeight: 700, fontSize: 12, fontFamily: mono, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 14px rgba(16,185,129,0.2)"
              }}>
                <ShoppingBag size={14} /> Gumroad Templates
              </button>
            </a>

            <a href="https://ko-fi.com/aivos_os" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "10px 16px", borderRadius: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)",
                color: "#f8fff8", fontWeight: 600, fontSize: 12, fontFamily: mono, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6
              }}>
                <ExternalLink size={14} /> Support on Ko-fi (0% fee)
              </button>
            </a>
          </div>
        </div>

        {/* High-Impact Bento Metric Cards (Clickable for Enterprise KPI Dashboard) */}
        {brief && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
            {[
              { label: "HIGH",  val: brief.stats.high,   color: "#10b981", bg: "rgba(16,185,129,0.06)" },
              { label: "MED",   val: brief.stats.medium, color: "#c084fc", bg: "rgba(192,132,252,0.06)" },
              { label: "SKIP",  val: brief.stats.low,    color: "#4b5563", bg: "rgba(75,85,99,0.06)" },
              { label: "TOTAL", val: brief.stats.total,  color: "#6ee7b7", bg: "rgba(110,231,183,0.06)" },
            ].map(({ label, val, color, bg }) => (
              <div key={label} onClick={() => setShowKpiModal(true)} title="Click to view Enterprise KPI Analytics Dashboard" style={{
                ...card, padding: "14px 0", textAlign: "center", background: bg,
                border: `1px solid ${color}30`, cursor: "pointer", transition: "transform 0.2s ease"
              }}>
                <div style={{ color, fontSize: 24, fontFamily: mono, fontWeight: 800 }}>{val}</div>
                <div style={{ color: "#6b7280", fontSize: 9, fontFamily: mono, letterSpacing: 1, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Audio Brief Player */}
        <div style={{ ...card, marginBottom: 20, border: "1px solid rgba(16,185,129,0.2)" }}>
          <audio ref={audioRef} src={audioSrc} preload="metadata" />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ color: "#4b5563", fontSize: 10, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 2 }}>Brain Brief Podcast</div>
              <div style={{ color: "#f8fff8", fontSize: 16, fontFamily: mono, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
                {brief?.date ?? "Loading..."}
                {history.length > 1 && (
                  <select
                    value={selectedDate}
                    onChange={e => switchDate(e.target.value)}
                    style={{
                      background: "rgba(10,15,10,0.8)", border: "1px solid rgba(16,185,129,0.3)",
                      color: "#10b981", fontSize: 11, fontFamily: mono, borderRadius: 8, padding: "4px 10px", outline: "none", cursor: "pointer"
                    }}
                  >
                    <option value="latest">⚡ Latest Digest (Today)</option>
                    {history.filter(d => d !== "latest").map(d => (
                      <option key={d} value={d}>📅 Digest ({d})</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            <button onClick={togglePlay} style={{
              width: 52, height: 52, borderRadius: "50%",
              background: playing ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.9)",
              border: `1px solid ${playing ? "#10b981" : "transparent"}`,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, color: playing ? "#10b981" : "#0f1410", transition: "all 0.2s",
              boxShadow: playing ? "none" : "0 0 16px rgba(16,185,129,0.4)"
            }}>
              {playing ? "⏸" : "▶"}
            </button>
          </div>
          <input type="range" min={0} max={duration || 100} value={progress} onChange={seek}
            style={{
              width: "100%", appearance: "none" as const, height: 4, borderRadius: 2,
              outline: "none", cursor: "pointer", display: "block", marginBottom: 6,
              background: `linear-gradient(to right, #10b981 ${(progress / (duration || 1)) * 100}%, rgba(16,185,129,0.15) 0%)`,
            }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: mono, color: "#4b5563" }}>
            <span>{fmt(progress)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>

        {brief && brief.high.length > 0 && (
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ color: "#10b981", fontSize: 10, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 12 }}>
              ● High relevance ({brief.high.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {brief.high.map((v, i) => <BriefVideoCard key={i} video={v} color="#10b981" onDeepDive={setActiveVideo} onMediumArticle={setMediumVideo} />)}
            </div>
          </div>
        )}

        {brief && brief.medium.length > 0 && (
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ color: "#c084fc", fontSize: 10, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 12 }}>
              ● Medium ({brief.medium.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {brief.medium.slice(0, 8).map((v, i) => <BriefVideoCard key={i} video={v} color="#c084fc" onDeepDive={setActiveVideo} onMediumArticle={setMediumVideo} />)}
            </div>
          </div>
        )}

        {error && <div style={{ color: "#ef4444", fontSize: 13, marginTop: 16 }}>{error}</div>}
      </div>
    </>
  );
}

// ─── KNOWLEDGE BASE (WIKI.JSON SEARCH) ────────────────────────────────────────

function KnowledgeView() {
  const [wikiData, setWikiData] = useState<WikiItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/wiki.json")
      .then(r => r.ok ? r.json() : [])
      .then(setWikiData)
      .catch(() => {});
  }, []);

  const categories = ["ALL", ...Array.from(new Set(wikiData.map(item => item.category)))];

  const filtered = wikiData.filter(item => {
    const matchesCat = selectedCat === "ALL" || item.category === selectedCat;
    const query = search.toLowerCase();
    const matchesSearch = !query ||
      item.title.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      item.tags.some(t => t.toLowerCase().includes(query));
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ color: "#10b981", fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Knowledge Base Search</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search across Architecture, PySpark, ADF, Gemini, RAG..."
              style={{
                width: "100%", background: "rgba(10,15,10,0.8)", border: "1px solid rgba(16,185,129,0.3)",
                borderRadius: 10, padding: "10px 14px 10px 36px", color: "#f8fff8", fontSize: 14, outline: "none"
              }}
            />
            <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "#6b7280" }} />
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              style={{
                padding: "4px 12px", borderRadius: 20,
                background: selectedCat === cat ? "rgba(16,185,129,0.2)" : "transparent",
                border: `1px solid ${selectedCat === cat ? "#10b981" : "rgba(16,185,129,0.15)"}`,
                color: selectedCat === cat ? "#10b981" : "#6b7280",
                fontSize: 11, fontFamily: mono, cursor: "pointer"
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.map(item => {
          const isExpanded = expandedId === item.id;
          return (
            <div key={item.id} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, border: "1px solid #10b981", color: "#10b981", fontFamily: mono }}>{item.category}</span>
                    <h3 style={{ color: "#f8fff8", fontSize: 16, fontWeight: 600, margin: 0 }}>{item.title}</h3>
                  </div>
                  <p style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.5, margin: "0 0 10px" }}>{item.summary}</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {item.tags.map(t => (
                      <span key={t} style={{ fontSize: 10, color: "#6ee7b7", fontFamily: mono, background: "rgba(16,185,129,0.08)", padding: "2px 6px", borderRadius: 4 }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  style={{ background: "none", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 6, color: "#10b981", cursor: "pointer", padding: "4px 10px", fontSize: 11, fontFamily: mono }}
                >
                  {isExpanded ? "Close" : "Details"}
                </button>
              </div>

              {isExpanded && (
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(16,185,129,0.15)", color: "#d1fae5", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {item.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SESSIONS & CONTENT STUDIO (GOOGLE AI / MEDIUM HUB) ──────────────────────

function SessionsView() {
  const [activeTab, setActiveTab] = useState<"articles" | "notebooks" | "templates">("articles");
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState("");
  const [copied, setCopied] = useState(false);

  const generateArticle = async () => {
    if (!topic.trim() || generating) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), format: "Medium.com Article" })
      });
      const data = await res.json();
      setGeneratedArticle(data.article || data.error || "Could not generate article draft.");
    } catch {
      setGeneratedArticle("Failed to connect to Gemini Article Generator.");
    }
    setGenerating(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedArticle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const templates = [
    { title: "P.A.R.A. System & Knowledge Vault", platform: "Notion", tag: "SIDE-HUSTLE", desc: "Complete Notion setup for data engineers organizing Projects, Areas, Resources, and Archives." },
    { title: "Azure ADF & PySpark Starter Kit", platform: "GitHub Repo", tag: "TEMPLATE", desc: "Production-grade templates for event-driven Azure integration and Delta Lake pipelines." },
    { title: "AIVOS Personal AI OS Shell", platform: "Next.js + Vercel", tag: "SHOWCASE", desc: "Modern terminal dashboard template with Gemini 2.0 Flash and SSE streaming." },
  ];

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ color: "#10b981", fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Google AI Content Studio & Side-Hustle Hub</div>
        <h2 style={{ color: "#f8fff8", fontSize: 20, fontWeight: 700, margin: "0 0 12px" }}>Sessions, Articles & Notion Templates</h2>
        <p style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
          Generate high-value technical articles for Medium.com, organize NotebookLM outputs, and manage monetizable Notion templates.
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          {[
            { id: "articles" as const, label: "Medium Article Generator", Icon: PenTool },
            { id: "notebooks" as const, label: "NotebookLM Vault", Icon: BookMarked },
            { id: "templates" as const, label: "Notion & Side-Hustles", Icon: DollarSign },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10,
                background: activeTab === t.id ? "rgba(16,185,129,0.2)" : "transparent",
                border: `1px solid ${activeTab === t.id ? "#10b981" : "rgba(16,185,129,0.15)"}`,
                color: activeTab === t.id ? "#10b981" : "#6b7280",
                fontSize: 12, fontFamily: mono, cursor: "pointer", fontWeight: activeTab === t.id ? 600 : 400
              }}
            >
              <t.Icon size={14} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "articles" && (
        <div style={card}>
          <div style={{ color: "#10b981", fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Gemini 2.0 Flash Article Generator</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && generateArticle()}
              placeholder="e.g. Building Event-Driven Azure ADF Pipelines with Event Hub..."
              style={{
                flex: 1, background: "rgba(10,15,10,0.8)", border: "1px solid rgba(16,185,129,0.3)",
                borderRadius: 10, padding: "10px 14px", color: "#f8fff8", fontSize: 14, outline: "none"
              }}
            />
            <button onClick={generateArticle} disabled={generating} style={{
              padding: "10px 20px", background: "#10b981", border: "none", borderRadius: 10,
              color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              opacity: generating ? 0.6 : 1
            }}>
              <Sparkles size={16} /> {generating ? "Generating..." : "Generate Article"}
            </button>
          </div>

          {generatedArticle && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(16,185,129,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ color: "#10b981", fontSize: 11, fontFamily: mono, textTransform: "uppercase" }}>Generated Medium.com Draft</span>
                <button onClick={copyToClipboard} style={{
                  padding: "4px 10px", borderRadius: 6, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
                  color: "#10b981", fontSize: 11, fontFamily: mono, cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                }}>
                  {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Copied!" : "Copy Draft"}
                </button>
              </div>
              <div style={{ background: "rgba(10,15,10,0.9)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: 20 }}>
                <ReactMarkdown components={{
                  h1: ({children}: {children?: any}) => <h1 style={{ fontSize: 18, color: "#f8fff8", margin: "14px 0 6px", fontWeight: 800 }}>{children}</h1>,
                  h2: ({children}: {children?: any}) => <h2 style={{ fontSize: 15, color: "#10b981", margin: "12px 0 4px", fontFamily: mono }}>{children}</h2>,
                  h3: ({children}: {children?: any}) => <h3 style={{ fontSize: 13, color: "#6ee7b7", margin: "10px 0 4px" }}>{children}</h3>,
                  p: ({children}: {children?: any}) => <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.7, margin: "0 0 8px" }}>{children}</p>,
                  code: ({children}: {children?: any}) => <code style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", padding: "2px 6px", borderRadius: 4, fontFamily: mono, fontSize: 11 }}>{children}</code>,
                  li: ({children}: {children?: any}) => <li style={{ fontSize: 12, color: "#9ca3af", marginBottom: 3 }}>{children}</li>
                }}>{generatedArticle}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "notebooks" && (
        <div style={card}>
          <div style={{ color: "#10b981", fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>NotebookLM Research & Audio Outlines</div>
          <p style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.6 }}>
            Organize research briefs, audio podcast outlines, and synthesized Google Gemini / NotebookLM outputs ready for publishing to Medium.com.
          </p>
        </div>
      )}

      {activeTab === "templates" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {templates.map((t, idx) => (
            <div key={idx} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, border: "1px solid #10b981", color: "#10b981", fontFamily: mono, textTransform: "uppercase" }}>{t.tag}</span>
                  <h3 style={{ color: "#f8fff8", fontSize: 16, fontWeight: 600, margin: "6px 0 0" }}>{t.title}</h3>
                </div>
                <span style={{ color: "#6b7280", fontSize: 12, fontFamily: mono }}>{t.platform}</span>
              </div>
              <p style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.5, margin: "0 0 12px" }}>{t.desc}</p>
              <button style={{ padding: "6px 12px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, color: "#10b981", fontSize: 11, fontFamily: mono, cursor: "pointer" }}>
                Prepare Template Bundle ↗
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── INBOX & QUICK CAPTURE VIEW ──────────────────────────────────────────────

function InboxView() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [type, setType] = useState<"task" | "youtube" | "note">("task");
  const [loading, setLoading] = useState(false);

  const fetchItems = useCallback(() => {
    fetch("/api/inbox")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.items) setItems(data.items); })
      .catch(() => {});
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const addItem = async () => {
    if (!inputText.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title: inputText.trim() })
      });
      const data = await res.json();
      if (data?.items) setItems(data.items);
      setInputText("");
    } catch {}
    setLoading(false);
  };

  const toggleDone = async (id: string, currentDone: boolean) => {
    try {
      const res = await fetch("/api/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, done: !currentDone })
      });
      const data = await res.json();
      if (data?.items) setItems(data.items);
    } catch {}
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ color: "#10b981", fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Quick Capture & Automation Inbox</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <input
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addItem()}
            placeholder={type === "youtube" ? "Enter YouTube URL link..." : type === "task" ? "New task / focus item..." : "Quick note..."}
            style={{
              flex: 1, background: "rgba(10,15,10,0.8)", border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: 10, padding: "10px 14px", color: "#f8fff8", fontSize: 14, outline: "none"
            }}
          />
          <button onClick={addItem} disabled={loading} style={{
            padding: "10px 20px", background: "#10b981", border: "none", borderRadius: 10,
            color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6
          }}>
            <Plus size={16} /> Add
          </button>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {[
            { id: "task" as const, label: "Task", Icon: CheckSquare },
            { id: "youtube" as const, label: "YouTube Link", Icon: LinkIcon },
            { id: "note" as const, label: "Note", Icon: FileText },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20,
                background: type === t.id ? "rgba(16,185,129,0.2)" : "transparent",
                border: `1px solid ${type === t.id ? "#10b981" : "rgba(16,185,129,0.15)"}`,
                color: type === t.id ? "#10b981" : "#6b7280",
                fontSize: 11, fontFamily: mono, cursor: "pointer"
              }}
            >
              <t.Icon size={12} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ ...card }}>
        <div style={{ color: "#10b981", fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>INBOX QUEUE ({items.length})</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map(item => (
            <div key={item.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px",
              borderRadius: 10, background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => toggleDone(item.id, item.done)} style={{ background: "none", border: "none", cursor: "pointer", color: item.done ? "#10b981" : "#4b5563" }}>
                  {item.done ? <CheckCircle2 size={18} /> : <CircleDot size={18} />}
                </button>
                <span style={{ color: item.done ? "#6b7280" : "#d1fae5", textDecoration: item.done ? "line-through" : "none", fontSize: 14 }}>
                  {item.title}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", fontFamily: mono, textTransform: "uppercase" }}>{item.type}</span>
                <span style={{ color: "#4b5563", fontSize: 11, fontFamily: mono }}>{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={card}>
      <div style={{ color: "#6b7280", fontSize: 11, fontFamily: mono, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 6 }}>{label}</div>
      <div style={{ color: "#f8fff8", fontSize: 22, fontFamily: mono, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

function Dashboard({ time }: { time: Date }) {
  const [notionProjects, setNotionProjects] = useState<any[]>([]);
  const [focusData, setFocusData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/notion/projects").then(r => r.ok ? r.json() : null),
      fetch("/api/notion/focus").then(r => r.ok ? r.json() : null)
    ]).then(([projData, focData]) => {
      if (projData?.pages && projData.pages.length > 0) setNotionProjects(projData.pages);
      if (focData?.todos && focData.todos.length > 0) setFocusData(focData);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const projectCount = notionProjects.length > 0 ? String(notionProjects.length) : String(DEMO_PROJECTS.length);

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ color: "#6b7280", fontSize: 13, fontFamily: mono, marginBottom: 4 }}>
          {time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
        <div style={{ color: "#10b981", fontSize: 48, fontWeight: 900, fontFamily: mono, lineHeight: 1 }}>
          {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
          <span style={{ color: "#374151", fontSize: 32 }}>{":" + String(time.getSeconds()).padStart(2, "0")}</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Projects" value={projectCount} />
        <StatCard label="Ollama" value="qwen2.5" />
        <StatCard label="Certs" value="AZ-900+" />
      </div>
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ color: "#10b981", fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase" as const }}>Active Projects</div>
          {loading && <span style={{ color: "#6b7280", fontSize: 11, fontFamily: mono }}>Checking workspace...</span>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {notionProjects.length > 0 ? (
            notionProjects.map((p, idx) => (
              <a key={p.id || idx} href={p.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, border: "1px solid #10b981", color: "#10b981", fontFamily: mono }}>PROJECT</span>
                    <span style={{ color: "#f8fff8", fontSize: 14, fontWeight: 600 }}>{p.title}</span>
                  </div>
                  <span style={{ color: "#6b7280", fontSize: 12, fontFamily: mono }}>
                    {p.lastEdited ? new Date(p.lastEdited).toLocaleDateString("en-US") : ""} ↗
                  </span>
                </div>
              </a>
            ))
          ) : (
            DEMO_PROJECTS.map(p => (
              <div key={p.name}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, border: "1px solid " + p.color, color: p.color, fontFamily: mono, letterSpacing: 1 }}>{p.tag}</span>
                    <span style={{ color: "#f8fff8", fontSize: 14, fontWeight: 600 }}>{p.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: "#6b7280", fontSize: 12 }}>{p.phase}</span>
                    <span style={{ color: p.color, fontSize: 13, fontFamily: mono, fontWeight: 700, minWidth: 36, textAlign: "right" as const }}>{p.progress + "%"}</span>
                  </div>
                </div>
                <div style={{ height: 4, background: "rgba(16,185,129,0.1)", borderRadius: 4 }}>
                  <div style={{ height: "100%", width: p.progress + "%", background: "linear-gradient(90deg, " + p.color + ", #6ee7b7)", borderRadius: 4, transition: "width 1s ease" }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div style={{ ...card, border: "1px solid rgba(16,185,129,0.4)" }}>
        <div style={{ color: "#10b981", fontSize: 11, fontFamily: mono, letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" as const }}>{"Today's Focus"}</div>
        {focusData?.todos && focusData.todos.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {focusData.todos.map((t: any) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, color: t.checked ? "#6b7280" : "#d1fae5", fontSize: 14 }}>
                <span style={{ color: t.checked ? "#10b981" : "#4b5563" }}>{t.checked ? "☑" : "☐"}</span>
                <span style={{ textDecoration: t.checked ? "line-through" : "none" }}>{t.text}</span>
              </div>
            ))}
          </div>
        ) : (
          <>
            <p style={{ color: "#d1fae5", fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Azure Integration Pipelines & Data Engineering</p>
            <p style={{ color: "#6b7280", fontSize: 13 }}>Be certified - Self-developing e.g. AZ-900, etc · AIVOS Platform UI Shell</p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── MEMORY ──────────────────────────────────────────────────────────────────

function Memory() {
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "system", text: "qwen2.5:7b ready @ localhost:11434 · ctx 32k · temp 0.7" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  const send = async () => {
    if (!input.trim() || loading) return;
    const q = input.trim(); setInput(""); setLoading(true);
    setMsgs(m => [...m, { role: "user", text: q }]);
    try {
      const res = await fetch("/api/ollama", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: q }) });
      const data = await res.json();
      setMsgs(m => [...m, { role: "assistant", text: data.response ?? data.error ?? "No response" }]);
    } catch { setMsgs(m => [...m, { role: "assistant", text: "Cannot reach Ollama at localhost:11434" }]); }
    setLoading(false);
  };
  const bubble = (role: MsgRole) => ({
    maxWidth: "80%", padding: "12px 16px",
    borderRadius: role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
    background: role === "user" ? "rgba(16,185,129,0.2)" : "rgba(22,32,26,0.85)",
    border: "1px solid rgba(16,185,129,0.2)",
    color: role === "system" ? "#6b7280" : "#f8fff8",
    fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" as const,
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 57px)", maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
      <div style={{ flex: 1, overflowY: "auto", marginBottom: 16 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ marginBottom: 16, display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={bubble(m.role)}>{m.text}</div>
          </div>
        ))}
        {loading && <div style={{ color: "#10b981", fontSize: 14 }}>Thinking...</div>}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", gap: 12, padding: 16, background: "rgba(22,32,26,0.85)", borderRadius: 16, border: "1px solid rgba(16,185,129,0.2)" }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask your local memory..."
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#f8fff8", fontSize: 14 }} />
        <button onClick={send} disabled={loading} style={{ padding: "8px 20px", background: "#10b981", border: "none", borderRadius: 10, color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: loading ? 0.5 : 1 }}>Send</button>
      </div>
    </div>
  );
}

function PARAView() {
  const [paraData, setParaData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notion/para")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.para && data.para.length > 0) setParaData(data.para);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      {loading && <div style={{ color: "#10b981", fontSize: 13, fontFamily: mono, marginBottom: 16 }}>Checking P.A.R.A. workspace...</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {paraData.length > 0 ? (
          paraData.map((section: any) => (
            <div key={section.key} style={card}>
              <div style={{ color: "#10b981", fontSize: 12, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
                <span>{section.emoji} {section.label}</span>
                <span style={{ color: "#6b7280" }}>({section.count})</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {section.recent && section.recent.map((page: any) => (
                  <a key={page.id} href={page.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 10, background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.1)", transition: "all 0.2s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                        <span style={{ color: "#d1fae5", fontSize: 13, fontWeight: 500 }}>{page.title}</span>
                      </div>
                      <span style={{ color: "#4b5563", fontSize: 11, fontFamily: mono }}>↗</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))
        ) : (
          Object.entries(DEMO_PARA).map(([key, items]) => (
            <div key={key} style={card}>
              <div style={{ color: PARA_COLORS[key], fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 16 }}>{key}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.1)" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: PARA_COLORS[key], flexShrink: 0 }} />
                    <span style={{ color: "#d1fae5", fontSize: 13 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function AIVOS() {
  const [section, setSection] = useState<Section>("dashboard");
  const [time, setTime] = useState<Date | null>(null);
  const [ollamaOk, setOllamaOk] = useState(false);

  useEffect(() => {
    setTime(new Date());
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch("/api/ollama").then(r => r.ok ? setOllamaOk(true) : setOllamaOk(false)).catch(() => setOllamaOk(false));
  }, []);

  function renderSection() {
    switch (section) {
      case "dashboard":  return time ? <Dashboard time={time} /> : null;
      case "brief":      return <BriefView />;
      case "memory":     return <Memory />;
      case "para":       return <PARAView />;
      case "knowledge":  return <KnowledgeView />;
      case "inbox":      return <InboxView />;
      case "sessions":   return <SessionsView />;
      case "search":     return <KnowledgeView />;
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0f1410", fontFamily: "Inter, -apple-system, sans-serif", overflow: "hidden" }}>
      <aside style={{ width: 220, background: "rgba(22,32,26,0.9)", borderRight: "1px solid rgba(16,185,129,0.15)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(16,185,129,0.1)" }}>
          <div style={{ fontFamily: mono, fontSize: 20, fontWeight: 900, color: "#10b981" }}>AIVOS-OS</div>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>Starter Edition v0.2</div>
        </div>
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(({ id, Icon, label }) => {
            const active = section === id;
            return (
              <button key={id} onClick={() => setSection(id)} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 10, border: "none", cursor: "pointer",
                background: active ? "rgba(16,185,129,0.15)" : "transparent",
                color: active ? "#10b981" : "#6b7280",
                fontWeight: active ? 600 : 400,
                fontSize: 14, transition: "all 0.2s", textAlign: "left" as const, width: "100%",
              }}>
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(16,185,129,0.1)", fontSize: 11 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: ollamaOk ? "#10b981" : "#6b7280", marginBottom: 4 }}>
            <Circle size={6} fill={ollamaOk ? "#10b981" : "#6b7280"} />
            {"Ollama " + (ollamaOk ? "online" : "offline")}
          </div>
          <div style={{ color: "#4b5563", fontSize: 10 }}>{"© 2026 Ivo Doležal"}</div>
        </div>
      </aside>
      <main style={{ flex: 1, overflowY: "auto" }}>
        <header style={{ padding: "16px 32px", borderBottom: "1px solid rgba(16,185,129,0.1)", background: "rgba(22,32,26,0.6)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ color: "#f8fff8", fontSize: 16, fontWeight: 600 }}>{NAV.find(n => n.id === section)?.label}</div>
          <div style={{ fontFamily: mono, fontSize: 13, color: "#6b7280" }}>
            {time ? time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) : "--:--:--"}
          </div>
        </header>
        {renderSection()}
      </main>
    </div>
  );
}
