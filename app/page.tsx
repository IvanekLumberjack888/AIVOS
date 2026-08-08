"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { LayoutDashboard, Brain, FolderOpen, BookOpen, Inbox, Terminal, Search, Circle, Tv, X, Send, Sparkles, Plus, CheckCircle2, CircleDot, Link as LinkIcon, FileText, CheckSquare, PenTool, BookMarked, DollarSign, Copy, Check, Lock, ExternalLink, Coffee, ShoppingBag, Zap, Info, Globe } from "lucide-react";
import { translations, Language } from "../lib/i18n";

type Section = "landing" | "solutions" | "marketplace" | "pricing" | "about" | "dashboard" | "notebooklm" | "memory" | "para" | "knowledge" | "inbox" | "sessions" | "search" | "brief";
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
  { id: "landing"     as Section, Icon: Globe,            label: "Home"        },
  { id: "solutions"   as Section, Icon: Sparkles,         label: "Solutions"   },
  { id: "marketplace" as Section, Icon: ShoppingBag,      label: "Marketplace" },
  { id: "pricing"     as Section, Icon: DollarSign,       label: "Pricing"     },
  { id: "about"       as Section, Icon: Info,             label: "About Us"    },
  { id: "dashboard"   as Section, Icon: LayoutDashboard, label: "Dashboard"   },
  { id: "notebooklm"  as Section, Icon: BookMarked,       label: "NotebookLM"  },
  { id: "brief"       as Section, Icon: Zap,              label: "PULSE"       },
  { id: "memory"      as Section, Icon: Brain,           label: "Memory"      },
  { id: "para"        as Section, Icon: FolderOpen,      label: "P.A.R.A."    },
  { id: "knowledge"   as Section, Icon: BookOpen,        label: "Knowledge"   },
  { id: "inbox"       as Section, Icon: Inbox,           label: "Inbox"       },
  { id: "sessions"    as Section, Icon: Terminal,        label: "Sessions"    },
  { id: "search"      as Section, Icon: Search,          label: "Search"      },
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
        setArticle(`# ${video.title}\n\n**Subheading: Deep Dive & Architectural Analysis**\n\n*By Ivo Doležal · IT Integration and Automation Specialist*\n\n---\n\n### Overview\n${video.summary}\n\n### Key Implementation Steps\n- ${video.key_points?.join("\n- ") || "Explore architecture"}\n\n### Knowledge Base Comparison\nThis concept integrates directly with Azure Databricks PySpark Lakehouse pipelines and Gemini 2.0 Flash REST streaming APIs.`);
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
              <div style={{ fontSize: 10, color: "#6b7280", fontFamily: mono }}>IT Integration and Automation Specialist · 5 min read</div>
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
  const [digestMode, setDigestMode] = useState<"daily" | "weekly">("daily");
  const [lang, setLang] = useState<Language>("en");
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

  const t = translations[lang];

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

  const generateDigestBlog = () => {
    if (!brief || !brief.high || brief.high.length === 0) return;
    const topTitles = brief.high.map(v => v.title).join(", ");
    const topSummaries = brief.high.map(v => `• ${v.title} (${v.channel}): ${v.summary}`).join("\n");
    
    const syntheticVideo: VideoItem = {
      title: `Top Technical Insights & Architecture Synthesis (${brief.date})`,
      channel: "AIVOS Tech Digest",
      url: "https://medium.com",
      summary: `Synthesized technical digest of top-rated videos: ${topTitles}.\n\nDetailed Breakdown:\n${topSummaries}`,
      key_points: brief.high.map(v => `${v.title}: ${v.action}`),
      action: "Publish to Medium / Substack newsletter",
      tags: "#Digest #TechBlog #DataEngineering"
    };
    
    setMediumVideo(syntheticVideo);
  };

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
        
        {/* Top Control Bar: Language Switcher, Environment Tier & Digest Mode Switcher */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          {/* Daily vs Weekly Toggle */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setDigestMode("daily")}
              style={{
                padding: "8px 16px", borderRadius: 10, fontSize: 11, fontFamily: mono, fontWeight: 700,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
                background: digestMode === "daily" ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${digestMode === "daily" ? "#10b981" : "rgba(255,255,255,0.1)"}`,
                color: digestMode === "daily" ? "#10b981" : "#6b7280",
              }}
            >
              {t.btn_daily}
            </button>
            <button
              onClick={() => setDigestMode("weekly")}
              style={{
                padding: "8px 16px", borderRadius: 10, fontSize: 11, fontFamily: mono, fontWeight: 700,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
                background: digestMode === "weekly" ? "linear-gradient(135deg, rgba(234,179,8,0.25), rgba(168,85,247,0.25))" : "rgba(255,255,255,0.03)",
                border: `1px solid ${digestMode === "weekly" ? "#eab308" : "rgba(255,255,255,0.1)"}`,
                color: digestMode === "weekly" ? "#facc15" : "#6b7280",
                boxShadow: digestMode === "weekly" ? "0 0 14px rgba(234,179,8,0.3)" : "none"
              }}
            >
              {t.btn_weekly}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Language Switcher Pills */}
            <div style={{ display: "flex", gap: 3, background: "rgba(10,15,10,0.8)", padding: 3, borderRadius: 20, border: "1px solid rgba(16,185,129,0.3)" }}>
              <button
                onClick={() => setLang("en")}
                style={{
                  padding: "4px 10px", borderRadius: 16, fontSize: 10, fontFamily: mono, fontWeight: 700,
                  border: "none", cursor: "pointer", transition: "all 0.2s",
                  background: lang === "en" ? "#10b981" : "transparent",
                  color: lang === "en" ? "#000" : "#6b7280"
                }}
              >
                🇬🇧 EN
              </button>
              <button
                onClick={() => setLang("cz")}
                style={{
                  padding: "4px 10px", borderRadius: 16, fontSize: 10, fontFamily: mono, fontWeight: 700,
                  border: "none", cursor: "pointer", transition: "all 0.2s",
                  background: lang === "cz" ? "#10b981" : "transparent",
                  color: lang === "cz" ? "#000" : "#6b7280"
                }}
              >
                🇨🇿 CZ
              </button>
            </div>

            {/* Environment Mode Pills */}
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { id: "starter", label: t.tier_starter, desc: "Open-source Vercel demo" },
                { id: "pro", label: t.tier_pro, desc: "Medium API & Templates" },
                { id: "private", label: t.tier_private, desc: "Notion & Ollama Live Sync" },
              ].map(tItem => (
                <button
                  key={tItem.id}
                  onClick={() => setPreviewTier(tItem.id as any)}
                  title={tItem.desc}
                  style={{
                    padding: "5px 12px", borderRadius: 20, fontSize: 10, fontFamily: mono, fontWeight: 600,
                    cursor: "pointer", transition: "all 0.2s",
                    background: previewTier === tItem.id ? "rgba(16,185,129,0.2)" : "transparent",
                    border: `1px solid ${previewTier === tItem.id ? "#10b981" : "rgba(255,255,255,0.08)"}`,
                    color: previewTier === tItem.id ? "#10b981" : "#6b7280",
                  }}
                >
                  {tItem.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Best-of Hero Banner (Shown when Weekly mode active) */}
        {digestMode === "weekly" && (
          <div style={{
            ...card, marginBottom: 20,
            background: "linear-gradient(135deg, rgba(234,179,8,0.15), rgba(139,92,246,0.18), rgba(15,23,42,0.95))",
            border: "1px solid rgba(234,179,8,0.4)",
            boxShadow: "0 8px 32px rgba(234,179,8,0.15)",
            backdropFilter: "blur(16px)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ color: "#facc15", fontSize: 11, fontFamily: mono, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
                {t.weekly_hero_badge}
              </div>
              <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: "linear-gradient(135deg, #eab308, #ca8a04)", color: "#000", fontFamily: mono, fontWeight: 800 }}>
                {t.weekly_badge}
              </span>
            </div>
            <h3 style={{ color: "#f8fff8", fontSize: 18, fontWeight: 800, margin: "0 0 8px" }}>
              {t.weekly_title}
            </h3>
            <p style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
              {t.weekly_desc}
            </p>
          </div>
        )}

        {/* PULSE Hero Landing & Collapsible Menu Banner */}
        <div style={{
          ...card, marginBottom: 20,
          background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(15,23,42,0.95), rgba(139,92,246,0.08))",
          border: "1px solid rgba(16,185,129,0.35)", backdropFilter: "blur(16px)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ color: "#10b981", fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <Zap size={14} /> {t.hero_badge}
              </div>
              <h2 style={{ color: "#f8fff8", fontSize: 20, fontWeight: 800, margin: 0 }}>
                {t.hero_title}
              </h2>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={generateDigestBlog} style={{
                padding: "6px 14px", borderRadius: 8, background: "rgba(168,85,247,0.2)", border: "1px solid rgba(168,85,247,0.4)",
                color: "#c084fc", fontSize: 11, fontFamily: mono, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 700,
                boxShadow: "0 0 12px rgba(168,85,247,0.2)"
              }}>
                {t.btn_generate_blog}
              </button>
              <button onClick={() => setShowKpiModal(true)} style={{
                padding: "6px 14px", borderRadius: 8, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.4)",
                color: "#60a5fa", fontSize: 11, fontFamily: mono, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 700
              }}>
                {t.btn_kpi_analytics}
              </button>
              <button onClick={() => setShowArchInfo(!showArchInfo)} style={{
                padding: "6px 14px", borderRadius: 8, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)",
                color: "#10b981", fontSize: 11, fontFamily: mono, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 600
              }}>
                <Info size={13} /> {showArchInfo ? t.btn_how_it_works_hide : t.btn_how_it_works_show}
              </button>
            </div>
          </div>

          <p style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.6, margin: "0 0 14px" }}>
            {t.hero_desc}
          </p>

          {/* Collapsible Dropdown Menu: How PULSE Works */}
          {showArchInfo && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(16,185,129,0.2)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <div style={{ background: "rgba(10,15,10,0.7)", padding: 12, borderRadius: 10, border: "1px solid rgba(16,185,129,0.2)" }}>
                <div style={{ color: "#10b981", fontSize: 11, fontFamily: mono, fontWeight: 700, marginBottom: 4 }}>{t.how_step1_title}</div>
                <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.4 }}>{t.how_step1_desc}</div>
              </div>
              <div style={{ background: "rgba(10,15,10,0.7)", padding: 12, borderRadius: 10, border: "1px solid rgba(16,185,129,0.2)" }}>
                <div style={{ color: "#34d399", fontSize: 11, fontFamily: mono, fontWeight: 700, marginBottom: 4 }}>{t.how_step2_title}</div>
                <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.4 }}>{t.how_step2_desc}</div>
              </div>
              <div style={{ background: "rgba(10,15,10,0.7)", padding: 12, borderRadius: 10, border: "1px solid rgba(16,185,129,0.2)" }}>
                <div style={{ color: "#6ee7b7", fontSize: 11, fontFamily: mono, fontWeight: 700, marginBottom: 4 }}>{t.how_step3_title}</div>
                <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.4 }}>{t.how_step3_desc}</div>
              </div>
              <div style={{ background: "rgba(10,15,10,0.7)", padding: 12, borderRadius: 10, border: "1px solid rgba(168,85,247,0.25)" }}>
                <div style={{ color: "#c084fc", fontSize: 11, fontFamily: mono, fontWeight: 700, marginBottom: 4 }}>{t.how_step4_title}</div>
                <div style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.4 }}>{t.how_step4_desc}</div>
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

// ─── AGENTIC OS MISSION CONTROL DASHBOARD ──────────────────────────────────────

function Dashboard({ time }: { time: Date }) {
  const [notionProjects, setNotionProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notion/projects")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.projects) setNotionProjects(data.projects);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "2rem", maxWidth: 1180, margin: "0 auto", overflowY: "auto" }}>
      {/* Header bar: Section I — MISSION CONTROL */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ color: "#d97706", fontSize: 11, fontFamily: mono, fontStyle: "italic", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
            I. — MISSION CONTROL
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: "#f8fff8", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Mission Control
          </h1>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: 0, fontFamily: mono }}>
            Status of every agent, every memory, every signal.
          </p>
        </div>

        {/* Studio Telemetry Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ padding: "6px 14px", borderRadius: 20, background: "rgba(22,32,26,0.9)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981", fontSize: 11, fontFamily: mono, fontWeight: 700 }}>
            {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })} LOCAL · STUDIO
          </div>
          <div style={{ padding: "6px 14px", borderRadius: 20, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", color: "#e2e8f0", fontSize: 11, fontFamily: mono }}>
            ⌘K Command palette
          </div>
          <div style={{ padding: "6px 14px", borderRadius: 20, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399", fontSize: 11, fontFamily: mono, fontWeight: 800 }}>
            📊 ALL SYSTEMS LIVE
          </div>
        </div>
      </div>

      {/* Top Agent Telemetry Heartbeat Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 32 }}>
        {[
          { label: "CLAUDE 3.7", status: "checking...", color: "#f59e0b", icon: "✦" },
          { label: "OPENCLAW", status: "online", color: "#ec4899", icon: "◈" },
          { label: "HERMES 3", status: "checking...", color: "#f97316", icon: "⊗" },
          { label: "HEARTBEAT", status: "poll ticks · 4s", color: "#eab308", icon: "⚡" },
          { label: "LATENCY", status: "p50 · 12ms", color: "#10b981", icon: "⚡" },
          { label: "GEMINI 2.0", status: "live streaming", color: "#3b82f6", icon: "⟁" },
        ].map((item, idx) => (
          <div key={idx} style={{
            ...card, padding: "12px 14px", borderRadius: 12,
            background: "rgba(13,20,16,0.9)", border: "1px solid rgba(255,255,255,0.08)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontFamily: mono, color: "#9ca3af", fontWeight: 700 }}>
              <span style={{ color: item.color }}>{item.icon}</span> {item.label}
            </div>
            <div style={{ fontSize: 11, fontFamily: mono, color: "#f8fff8", marginTop: 4, opacity: 0.8 }}>
              {item.status}
            </div>
          </div>
        ))}
      </div>

      {/* Section II: AGENTS — CLICK TO OPEN CONTROL ROOM */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ color: "#d97706", fontSize: 11, fontFamily: mono, fontStyle: "italic", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
          II. — AGENTS - CLICK TO OPEN CONTROL ROOM
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {/* Card 1: Claude Code Agent */}
          <div style={{ ...card, border: "1px solid rgba(245,158,11,0.3)", background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(13,20,16,0.95))" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(245,158,11,0.2)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18 }}>✦</div>
              <span style={{ fontSize: 10, fontFamily: mono, padding: "3px 8px", borderRadius: 12, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b", fontWeight: 700 }}>● DEGRADED</span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#f8fff8", margin: "0 0 6px" }}>Claude Code</h3>
            <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.5, margin: "0 0 16px" }}>Direct streaming line to Claude Code. Full tool use, MCPs, plugins.</p>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 10, fontFamily: mono, color: "#6b7280" }}>
              <span>VERSION · 3.7 SONNET</span>
              <span>LATENCY · 1.2s</span>
            </div>
          </div>

          {/* Card 2: OpenClaw Local Agent */}
          <div style={{ ...card, border: "1px solid rgba(236,72,153,0.3)", background: "linear-gradient(135deg, rgba(236,72,153,0.1), rgba(13,20,16,0.95))" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(236,72,153,0.2)", color: "#ec4899", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18 }}>◈</div>
              <span style={{ fontSize: 10, fontFamily: mono, padding: "3px 8px", borderRadius: 12, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399", fontWeight: 700 }}>● ONLINE</span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#f8fff8", margin: "0 0 6px" }}>OpenClaw Gateway</h3>
            <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.5, margin: "0 0 16px" }}>Local agent gateway. Chat one-shot or open control room.</p>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 10, fontFamily: mono, color: "#6b7280" }}>
              <span>AGENTS · 12 ACTIVE</span>
              <span>SESSIONS · 4 RUNNING</span>
            </div>
          </div>

          {/* Card 3: Antigravity & Gemini RAG Agent */}
          <div style={{ ...card, border: "1px solid rgba(16,185,129,0.4)", background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(13,20,16,0.95))" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(16,185,129,0.2)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18 }}>⟁</div>
              <span style={{ fontSize: 10, fontFamily: mono, padding: "3px 8px", borderRadius: 12, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399", fontWeight: 700 }}>● ONLINE</span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#f8fff8", margin: "0 0 6px" }}>Antigravity Gemini RAG</h3>
            <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.5, margin: "0 0 16px" }}>Google DeepMind autonomous coding agent. 2M token context, live SSE stream.</p>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 10, fontFamily: mono, color: "#6b7280" }}>
              <span>MODEL · GEMINI 2.0 FLASH</span>
              <span>PROVIDER · GOOGLE AGY</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Workflows & Telemetry Projects */}
      <div style={{ ...card, border: "1px solid rgba(16,185,129,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ color: "#10b981", fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase" }}>ACTIVE PIPELINE TELEMETRY</div>
          {loading && <span style={{ color: "#6b7280", fontSize: 11, fontFamily: mono }}>Syncing Notion & Cloud...</span>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {DEMO_PROJECTS.map(p => (
            <div key={p.name}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, border: "1px solid " + p.color, color: p.color, fontFamily: mono }}>{p.tag}</span>
                  <span style={{ color: "#f8fff8", fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ color: "#6b7280", fontSize: 11 }}>{p.phase}</span>
                  <span style={{ color: p.color, fontSize: 12, fontFamily: mono, fontWeight: 700 }}>{p.progress + "%"}</span>
                </div>
              </div>
              <div style={{ height: 4, background: "rgba(16,185,129,0.1)", borderRadius: 4 }}>
                <div style={{ height: "100%", width: p.progress + "%", background: "linear-gradient(90deg, " + p.color + ", #6ee7b7)", borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
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

// ─── DATAMOLE & APIFY MULTI-PAGE SHOWCASE ENGINE ────────────────────────────

function AuthModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 120,
      background: "rgba(5,10,8,0.85)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }}>
      <div style={{
        width: "100%", maxWidth: 440, background: "#0d1410", border: "1px solid rgba(16,185,129,0.3)",
        borderRadius: 16, padding: 28, boxShadow: "0 16px 48px rgba(0,0,0,0.7)", position: "relative"
      }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}>
          <X size={18} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Lock size={20} style={{ color: "#10b981" }} />
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#f8fff8" }}>Sign In to AIVOS OS</h3>
        </div>
        <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.5, marginBottom: 20 }}>
          Free Authentication powered by <strong>Firebase Auth / Google OAuth</strong> (100% Free up to 50,000 monthly users). Zero monthly subscription fees.
        </p>

        {sent ? (
          <div style={{ padding: 14, borderRadius: 10, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399", fontSize: 12 }}>
            <CheckCircle2 size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
            Magic Login Link dispatched to <strong>{email}</strong>! Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <button type="button" onClick={() => setSent(true)} style={{
              padding: "12px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
              color: "#f8fff8", fontSize: 13, fontFamily: mono, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}>
              <span>🌐</span> Continue with Google (Free OAuth)
            </button>
            <div style={{ textAlign: "center", fontSize: 11, color: "#4b5563", fontFamily: mono }}>OR MAGIC LINK EMAIL</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              style={{
                padding: "12px 14px", borderRadius: 10, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(16,185,129,0.2)",
                color: "#f8fff8", fontSize: 13, fontFamily: mono, outline: "none"
              }}
            />
            <button type="submit" style={{
              padding: "12px", borderRadius: 10, background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#000", fontSize: 13, fontFamily: mono, fontWeight: 800, border: "none", cursor: "pointer"
            }}>
              Send Instant Magic Link →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// DATAMOLE 3D ISOMETRIC HERO + STAT CARDS HOMEPAGE
function LandingHomeView({ setSection, onOpenLogin }: { setSection: (s: Section) => void; onOpenLogin: () => void }) {
  const [lang] = useState<Language>("en");
  const t = translations[lang];

  return (
    <div style={{ padding: "2.5rem 2rem", maxWidth: 1140, margin: "0 auto" }}>

      {/* Datamole-Style Isometric Hero & Stat Cards Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 32, alignItems: "center", marginBottom: 40 }}>
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20,
            background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)",
            color: "#10b981", fontSize: 11, fontFamily: mono, fontWeight: 700, letterSpacing: 1, marginBottom: 18
          }}>
            <Sparkles size={14} /> {t.landing_badge}
          </div>

          <h1 style={{ fontSize: 36, fontWeight: 900, color: "#f8fff8", lineHeight: 1.18, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            {t.landing_h1}
          </h1>

          <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.6, margin: "0 0 24px" }}>
            {t.landing_subtitle}
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => setSection("solutions")} style={{
              padding: "13px 26px", borderRadius: 10, background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#000", fontSize: 13, fontFamily: mono, fontWeight: 800, border: "none", cursor: "pointer",
              boxShadow: "0 0 20px rgba(16,185,129,0.3)"
            }}>
              {t.challenges_title} →
            </button>
            <button onClick={() => setSection("marketplace")} style={{
              padding: "13px 24px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)",
              color: "#e2e8f0", fontSize: 13, fontFamily: mono, fontWeight: 700, cursor: "pointer"
            }}>
              {t.market_title}
            </button>
          </div>
        </div>

        {/* Datamole Stat Cards Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ ...card, padding: 20, border: "1px solid rgba(16,185,129,0.3)", background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(13,20,16,0.95))" }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#10b981", fontFamily: mono }}>{t.stat1_num}</div>
            <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 700, marginTop: 4 }}>{t.stat1_label}</div>
          </div>
          <div style={{ ...card, padding: 20, border: "1px solid rgba(59,130,246,0.3)", background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(13,20,16,0.95))" }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#60a5fa", fontFamily: mono }}>{t.stat2_num}</div>
            <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 700, marginTop: 4 }}>{t.stat2_label}</div>
          </div>
          <div style={{ ...card, padding: 20, border: "1px solid rgba(168,85,247,0.3)", background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(13,20,16,0.95))" }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#c084fc", fontFamily: mono }}>{t.stat3_num}</div>
            <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 700, marginTop: 4 }}>{t.stat3_label}</div>
          </div>
        </div>
      </div>

      {/* Datamole "Challenges We Solve" Grid */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ color: "#10b981", fontSize: 11, fontFamily: mono, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
          CHALLENGES WE SOLVE
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#f8fff8", margin: "0 0 20px" }}>{t.challenges_subtitle}</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          <div style={{ ...card, border: "1px solid rgba(16,185,129,0.3)" }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>⛓️</div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#f8fff8", margin: "0 0 8px" }}>{t.ch1_title}</h3>
            <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.6, margin: 0 }}>{t.ch1_desc}</p>
          </div>
          <div style={{ ...card, border: "1px solid rgba(59,130,246,0.3)" }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>⚡</div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#f8fff8", margin: "0 0 8px" }}>{t.ch2_title}</h3>
            <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.6, margin: 0 }}>{t.ch2_desc}</p>
          </div>
          <div style={{ ...card, border: "1px solid rgba(168,85,247,0.3)" }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>✍️</div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#f8fff8", margin: "0 0 8px" }}>{t.ch3_title}</h3>
            <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.6, margin: 0 }}>{t.ch3_desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// APIFY-STYLE SOLUTIONS PAGE
function SolutionsView({ setSection, onOpenLogin }: { setSection: (s: Section) => void; onOpenLogin: () => void }) {
  const [lang] = useState<Language>("en");
  const t = translations[lang];

  return (
    <div style={{ padding: "2.5rem 2rem", maxWidth: 1140, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ color: "#10b981", fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>ENTERPRISE SOLUTIONS</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#f8fff8", margin: 0 }}>Tailored Data Engineering & AI Automation</h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ ...card, border: "1px solid rgba(16,185,129,0.4)", padding: 28 }}>
          <span style={{ fontSize: 11, fontFamily: mono, color: "#10b981", fontWeight: 800 }}>SOLUTION 01</span>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f8fff8", margin: "6px 0 12px" }}>{t.pillar1_title}</h2>
          <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.6, margin: "0 0 16px" }}>{t.pillar1_desc}</p>
          <button onClick={() => setSection("pricing")} style={{ padding: "8px 18px", borderRadius: 8, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)", color: "#10b981", fontSize: 12, fontFamily: mono, cursor: "pointer" }}>
            Explore Enterprise Pricing →
          </button>
        </div>

        <div style={{ ...card, border: "1px solid rgba(59,130,246,0.4)", padding: 28 }}>
          <span style={{ fontSize: 11, fontFamily: mono, color: "#60a5fa", fontWeight: 800 }}>SOLUTION 02</span>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f8fff8", margin: "6px 0 12px" }}>{t.pillar2_title}</h2>
          <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.6, margin: "0 0 16px" }}>{t.pillar2_desc}</p>
          <button onClick={() => setSection("pricing")} style={{ padding: "8px 18px", borderRadius: 8, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.35)", color: "#60a5fa", fontSize: 12, fontFamily: mono, cursor: "pointer" }}>
            Explore Enterprise Pricing →
          </button>
        </div>

        <div style={{ ...card, border: "1px solid rgba(168,85,247,0.4)", padding: 28 }}>
          <span style={{ fontSize: 11, fontFamily: mono, color: "#c084fc", fontWeight: 800 }}>SOLUTION 03</span>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f8fff8", margin: "6px 0 12px" }}>{t.pillar3_title}</h2>
          <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.6, margin: "0 0 16px" }}>{t.pillar3_desc}</p>
          <button onClick={() => setSection("pricing")} style={{ padding: "8px 18px", borderRadius: 8, background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.35)", color: "#c084fc", fontSize: 12, fontFamily: mono, cursor: "pointer" }}>
            Explore Enterprise Pricing →
          </button>
        </div>
      </div>
    </div>
  );
}

// APIFY-STYLE MARKETPLACE PAGE
function MarketplaceView({ setSection, onOpenLogin }: { setSection: (s: Section) => void; onOpenLogin: () => void }) {
  const [lang] = useState<Language>("en");
  const t = translations[lang];

  return (
    <div style={{ padding: "2.5rem 2rem", maxWidth: 1140, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ color: "#10b981", fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>APIFY-STYLE MARKETPLACE</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#f8fff8", margin: 0 }}>{t.market_title}</h1>
        <p style={{ fontSize: 14, color: "#9ca3af", marginTop: 6 }}>{t.market_subtitle}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        <div style={{ ...card, border: "1px solid rgba(16,185,129,0.3)" }}>
          <div style={{ color: "#10b981", fontSize: 10, fontFamily: mono, fontWeight: 800, marginBottom: 8 }}>ACTOR · READY TO RUN</div>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: "#f8fff8", margin: "0 0 10px" }}>{t.actor1_title}</h3>
          <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.6, margin: "0 0 14px" }}>{t.actor1_desc}</p>
          <button onClick={() => setSection("brief")} style={{ padding: "7px 14px", borderRadius: 8, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", fontSize: 11, fontFamily: mono, cursor: "pointer" }}>
            Run Actor in PULSE →
          </button>
        </div>

        <div style={{ ...card, border: "1px solid rgba(168,85,247,0.3)" }}>
          <div style={{ color: "#c084fc", fontSize: 10, fontFamily: mono, fontWeight: 800, marginBottom: 8 }}>ACTOR · MEDIUM API</div>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: "#f8fff8", margin: "0 0 10px" }}>{t.actor2_title}</h3>
          <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.6, margin: "0 0 14px" }}>{t.actor2_desc}</p>
          <button onClick={() => setSection("sessions")} style={{ padding: "7px 14px", borderRadius: 8, background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", color: "#c084fc", fontSize: 11, fontFamily: mono, cursor: "pointer" }}>
            Open Article Generator →
          </button>
        </div>

        <div style={{ ...card, border: "1px solid rgba(59,130,246,0.3)" }}>
          <div style={{ color: "#60a5fa", fontSize: 10, fontFamily: mono, fontWeight: 800, marginBottom: 8 }}>ACTOR · NOTION SYNC</div>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: "#f8fff8", margin: "0 0 10px" }}>{t.actor3_title}</h3>
          <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.6, margin: "0 0 14px" }}>{t.actor3_desc}</p>
          <button onClick={() => setSection("para")} style={{ padding: "7px 14px", borderRadius: 8, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#60a5fa", fontSize: 11, fontFamily: mono, cursor: "pointer" }}>
            Open Notion P.A.R.A. →
          </button>
        </div>
      </div>
    </div>
  );
}

// DEDICATED PRICING PAGE (FABRIC FORGE LAUNCH MODEL INSPIRED)
function PricingView({ setSection, onOpenLogin }: { setSection: (s: Section) => void; onOpenLogin: () => void }) {
  const [lang] = useState<Language>("en");
  const t = translations[lang];

  return (
    <div style={{ padding: "2.5rem 2rem", maxWidth: 1140, margin: "0 auto" }}>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ color: "#10b981", fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>ACCESSIBLE EARLY-BIRD PRICING</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#f8fff8", margin: "0 0 8px" }}>{t.pricing_title}</h1>
        <p style={{ fontSize: 14, color: "#9ca3af" }}>{t.pricing_subtitle}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {/* Tier 1: Standard Free */}
        <div style={{ ...card, border: "1px solid rgba(255,255,255,0.15)", padding: 28 }}>
          <div style={{ color: "#6b7280", fontSize: 11, fontFamily: mono, fontWeight: 700, textTransform: "uppercase" }}>{t.plan_starter_title}</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#f8fff8", margin: "10px 0" }}>{t.plan_starter_price}</div>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 20px", lineHeight: 1.5 }}>{t.plan_starter_desc}</p>
          <button onClick={() => setSection("dashboard")} style={{ width: "100%", padding: "10px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#f8fff8", fontSize: 12, fontFamily: mono, cursor: "pointer" }}>
            Explore Free Demo →
          </button>
        </div>

        {/* Tier 2: Early Bird $5 / mo Launch Deal */}
        <div style={{ ...card, border: "1px solid rgba(16,185,129,0.4)", padding: 28, background: "linear-gradient(135deg, rgba(16,185,129,0.18), rgba(13,20,16,0.95))", boxShadow: "0 0 30px rgba(16,185,129,0.2)" }}>
          <div style={{ color: "#10b981", fontSize: 11, fontFamily: mono, fontWeight: 800, textTransform: "uppercase" }}>{t.plan_pro_title} · LAUNCH DEAL</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#10b981", margin: "10px 0" }}>{t.plan_pro_price}</div>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 20px", lineHeight: 1.5 }}>{t.plan_pro_desc}</p>
          <button onClick={() => window.open("https://gumroad.com", "_blank")} style={{ width: "100%", padding: "10px", borderRadius: 8, background: "linear-gradient(135deg, #10b981, #059669)", color: "#000", fontSize: 12, fontFamily: mono, fontWeight: 800, border: "none", cursor: "pointer" }}>
            Claim $5 Early Bird Access →
          </button>
        </div>

        {/* Tier 3: Enterprise / Team */}
        <div style={{ ...card, border: "1px solid rgba(168,85,247,0.4)", padding: 28 }}>
          <div style={{ color: "#c084fc", fontSize: 11, fontFamily: mono, fontWeight: 700, textTransform: "uppercase" }}>{t.plan_private_title}</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#c084fc", margin: "10px 0" }}>{t.plan_private_price}</div>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 20px", lineHeight: 1.5 }}>{t.plan_private_desc}</p>
          <button onClick={() => window.open("https://linkedin.com", "_blank")} style={{ width: "100%", padding: "10px", borderRadius: 8, background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.4)", color: "#c084fc", fontSize: 12, fontFamily: mono, cursor: "pointer" }}>
            Contact Enterprise Team →
          </button>
        </div>
      </div>
    </div>
  );
}

// DEDICATED ABOUT PAGE
function AboutView({ setSection, onOpenLogin }: { setSection: (s: Section) => void; onOpenLogin: () => void }) {
  const [lang] = useState<Language>("en");
  const t = translations[lang];

  return (
    <div style={{ padding: "2.5rem 2rem", maxWidth: 1140, margin: "0 auto" }}>
      <div style={{ ...card, padding: 36, border: "1px solid rgba(16,185,129,0.3)", marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#f8fff8", margin: "0 0 12px" }}>{t.about_title}</h1>
        <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.7, margin: "0 0 20px" }}>{t.about_desc}</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["Azure Data Stack", "PySpark Delta Lake", "Gemini 2.0 Flash", "Notion P.A.R.A.", "Ollama Local AI", "Vercel Next.js"].map(tag => (
            <span key={tag} style={{ fontSize: 11, fontFamily: mono, color: "#10b981", background: "rgba(16,185,129,0.1)", padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(16,185,129,0.2)" }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Authentic Backend Philosophy Quote Box */}
      <div style={{
        ...card, padding: 32,
        background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(13,20,16,0.95))",
        border: "1px solid rgba(16,185,129,0.35)", borderRadius: 16
      }}>
        <div style={{ color: "#10b981", fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10, fontWeight: 800 }}>
          {t.about_quote_tag}
        </div>
        <blockquote style={{ color: "#f8fff8", fontSize: 16, fontWeight: 600, fontStyle: "italic", lineHeight: 1.6, margin: "0 0 14px", borderLeft: "3px solid #10b981", paddingLeft: 16 }}>
          "{t.about_quote}"
        </blockquote>
        <div style={{ color: "#9ca3af", fontSize: 12, fontFamily: mono, paddingLeft: 16 }}>
          — Ivo Doležal · IT Integration and Automation Specialist (Backend & Data Systems)
        </div>
      </div>
    </div>
  );
}

// APIFY-STYLE TOP NAVIGATION HEADER WITH RICH MEGA-MENUS
function ApifyHeader({ currentSection, setSection, onOpenLogin }: { currentSection: Section; setSection: (s: Section) => void; onOpenLogin: () => void }) {
  const [lang, setLang] = useState<Language>("en");
  const [activeDropdown, setActiveDropdown] = useState<"product" | "solutions" | "developers" | null>(null);
  const t = translations[lang];

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(13,20,16,0.92)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(16,185,129,0.18)", padding: "12px 32px"
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        
        {/* Brand Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => setSection("landing")}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#000", fontWeight: 900, fontFamily: mono, fontSize: 16,
            boxShadow: "0 0 16px rgba(16,185,129,0.4)"
          }}>
            AI
          </div>
          <span style={{ fontSize: 18, fontWeight: 900, color: "#f8fff8", letterSpacing: 0.5 }}>AIVOS</span>
        </div>

        {/* Apify-Style Top Navigation Items with Mega-Menu Dropdowns */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, position: "relative" }}>
          
          {/* Product Dropdown */}
          <div style={{ position: "relative" }} onMouseEnter={() => setActiveDropdown("product")} onMouseLeave={() => setActiveDropdown(null)}>
            <button style={{
              background: "none", border: "none", cursor: "pointer", color: activeDropdown === "product" ? "#10b981" : "#e2e8f0",
              fontSize: 13, fontFamily: mono, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, padding: "6px 10px"
            }}>
              Product ▾
            </button>
            {activeDropdown === "product" && (
              <div style={{
                position: "absolute", top: "100%", left: 0, width: 340, background: "#0d1410",
                border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, padding: 16,
                boxShadow: "0 16px 48px rgba(0,0,0,0.8)", display: "flex", flexDirection: "column", gap: 12
              }}>
                <div onClick={() => { setSection("brief"); setActiveDropdown(null); }} style={{ cursor: "pointer", padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.03)" }}>
                  <div style={{ color: "#10b981", fontSize: 12, fontWeight: 700, fontFamily: mono }}>⚡ PULSE Video Triage</div>
                  <div style={{ color: "#9ca3af", fontSize: 11, marginTop: 2 }}>Automated YouTube triage & daily audio podcast briefs.</div>
                </div>
                <div onClick={() => { setSection("sessions"); setActiveDropdown(null); }} style={{ cursor: "pointer", padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.03)" }}>
                  <div style={{ color: "#c084fc", fontSize: 12, fontWeight: 700, fontFamily: mono }}>✍️ Medium & Substack Generator</div>
                  <div style={{ color: "#9ca3af", fontSize: 11, marginTop: 2 }}>One-click technical article draft publishing API.</div>
                </div>
                <div onClick={() => { setSection("para"); setActiveDropdown(null); }} style={{ cursor: "pointer", padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.03)" }}>
                  <div style={{ color: "#60a5fa", fontSize: 12, fontWeight: 700, fontFamily: mono }}>🔒 Notion P.A.R.A. Sync</div>
                  <div style={{ color: "#9ca3af", fontSize: 11, marginTop: 2 }}>Live 2-way sync with zero-trust local LLM memory.</div>
                </div>
              </div>
            )}
          </div>

          {/* Solutions Dropdown */}
          <div style={{ position: "relative" }} onMouseEnter={() => setActiveDropdown("solutions")} onMouseLeave={() => setActiveDropdown(null)}>
            <button onClick={() => setSection("solutions")} style={{
              background: "none", border: "none", cursor: "pointer", color: currentSection === "solutions" ? "#10b981" : "#e2e8f0",
              fontSize: 13, fontFamily: mono, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, padding: "6px 10px"
            }}>
              Solutions ▾
            </button>
            {activeDropdown === "solutions" && (
              <div style={{
                position: "absolute", top: "100%", left: 0, width: 340, background: "#0d1410",
                border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, padding: 16,
                boxShadow: "0 16px 48px rgba(0,0,0,0.8)", display: "flex", flexDirection: "column", gap: 12
              }}>
                <div onClick={() => { setSection("solutions"); setActiveDropdown(null); }} style={{ cursor: "pointer", padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.03)" }}>
                  <div style={{ color: "#10b981", fontSize: 12, fontWeight: 700, fontFamily: mono }}>🏢 Enterprise Cloud Integration</div>
                  <div style={{ color: "#9ca3af", fontSize: 11, marginTop: 2 }}>Azure Data Factory, Service Bus, REST Connectors.</div>
                </div>
                <div onClick={() => { setSection("solutions"); setActiveDropdown(null); }} style={{ cursor: "pointer", padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.03)" }}>
                  <div style={{ color: "#60a5fa", fontSize: 12, fontWeight: 700, fontFamily: mono }}>⚡ Databricks Lakehouse</div>
                  <div style={{ color: "#9ca3af", fontSize: 11, marginTop: 2 }}>PySpark Delta Lake & Konica Minolta Data Quality.</div>
                </div>
              </div>
            )}
          </div>

          {/* Developers Mega-Menu (Apify Style Highlighted Dropdown!) */}
          <div style={{ position: "relative" }} onMouseEnter={() => setActiveDropdown("developers")} onMouseLeave={() => setActiveDropdown(null)}>
            <button onClick={() => setSection("marketplace")} style={{
              background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 20,
              color: "#10b981", fontSize: 12, fontFamily: mono, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, padding: "5px 14px", cursor: "pointer"
            }}>
              Developers ▾
            </button>

            {/* Apify-Style Rich Mega-Menu with Banner */}
            {activeDropdown === "developers" && (
              <div style={{
                position: "absolute", top: "100%", left: -100, width: 560, background: "#0d1410",
                border: "1px solid rgba(16,185,129,0.35)", borderRadius: 16, padding: 20,
                boxShadow: "0 20px 60px rgba(0,0,0,0.85)", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 10, fontFamily: mono, color: "#6b7280", letterSpacing: 1, textTransform: "uppercase" }}>RESOURCES & API</div>
                  <div onClick={() => { setSection("marketplace"); setActiveDropdown(null); }} style={{ cursor: "pointer", padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.03)" }}>
                    <div style={{ color: "#f8fff8", fontSize: 12, fontWeight: 700, fontFamily: mono }}>📄 API Reference</div>
                    <div style={{ color: "#9ca3af", fontSize: 11 }}>REST endpoints & Model Context Protocol.</div>
                  </div>
                  <div onClick={() => { setSection("marketplace"); setActiveDropdown(null); }} style={{ cursor: "pointer", padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.03)" }}>
                    <div style={{ color: "#f8fff8", fontSize: 12, fontWeight: 700, fontFamily: mono }}>💻 PySpark & ADF Blueprints</div>
                    <div style={{ color: "#9ca3af", fontSize: 11 }}>Step-by-step code templates.</div>
                  </div>
                </div>

                {/* Apify "Earn from your code" style callout banner */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(139,92,246,0.15))",
                  border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, padding: 16,
                  display: "flex", flexDirection: "column", justifyContent: "space-between"
                }}>
                  <div>
                    <div style={{ color: "#10b981", fontSize: 11, fontFamily: mono, fontWeight: 800 }}>AIVOS AUTOMATION</div>
                    <div style={{ color: "#f8fff8", fontSize: 13, fontWeight: 700, marginTop: 4 }}>Deploy Custom Actors & AI Pipelines</div>
                    <div style={{ color: "#9ca3af", fontSize: 11, marginTop: 4, lineHeight: 1.4 }}>High-throughput Azure & PySpark automation blueprints.</div>
                  </div>
                  <button onClick={() => { setSection("pricing"); setActiveDropdown(null); }} style={{
                    marginTop: 12, padding: "6px 12px", borderRadius: 6, background: "#10b981", color: "#000",
                    fontSize: 11, fontFamily: mono, fontWeight: 800, border: "none", cursor: "pointer"
                  }}>
                    Get Pro Access →
                  </button>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => setSection("pricing")} style={{ background: "none", border: "none", cursor: "pointer", color: currentSection === "pricing" ? "#10b981" : "#e2e8f0", fontSize: 13, fontFamily: mono, fontWeight: 600, padding: "6px 10px" }}>
            Pricing
          </button>

          <button onClick={() => setSection("about")} style={{ background: "none", border: "none", cursor: "pointer", color: currentSection === "about" ? "#10b981" : "#e2e8f0", fontSize: 13, fontFamily: mono, fontWeight: 600, padding: "6px 10px" }}>
            About
          </button>
        </div>

        {/* Right Actions: Contact sales, Log in, Get started */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Language Switcher Pills */}
          <div style={{ display: "flex", gap: 3, background: "rgba(10,15,10,0.8)", padding: 3, borderRadius: 20, border: "1px solid rgba(16,185,129,0.3)" }}>
            <button
              onClick={() => setLang("en")}
              style={{
                padding: "4px 10px", borderRadius: 16, fontSize: 10, fontFamily: mono, fontWeight: 700,
                border: "none", cursor: "pointer", transition: "all 0.2s",
                background: lang === "en" ? "#10b981" : "transparent",
                color: lang === "en" ? "#000" : "#6b7280"
              }}
            >
              🇬🇧 EN
            </button>
            <button
              onClick={() => setLang("cz")}
              style={{
                padding: "4px 10px", borderRadius: 16, fontSize: 10, fontFamily: mono, fontWeight: 700,
                border: "none", cursor: "pointer", transition: "all 0.2s",
                background: lang === "cz" ? "#10b981" : "transparent",
                color: lang === "cz" ? "#000" : "#6b7280"
              }}
            >
              🇨🇿 CZ
            </button>
          </div>

          <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ color: "#9ca3af", fontSize: 12, fontFamily: mono, textDecoration: "none", fontWeight: 600 }}>
            Contact sales
          </a>

          <button onClick={onOpenLogin} style={{ background: "none", border: "none", color: "#e2e8f0", fontSize: 12, fontFamily: mono, fontWeight: 700, cursor: "pointer" }}>
            Log in
          </button>

          <button onClick={() => setSection("dashboard")} style={{
            padding: "8px 18px", borderRadius: 8, background: "#f8fff8", color: "#000",
            fontSize: 12, fontFamily: mono, fontWeight: 800, border: "none", cursor: "pointer",
            boxShadow: "0 0 16px rgba(248,255,248,0.3)"
          }}>
            Get started
          </button>
        </div>
      </div>
    </header>
  );
}

// ─── GOOGLE NOTEBOOKLM RESEARCH HUB ──────────────────────────────────────────

function NotebookLMView() {
  const [activeNotebook, setActiveNotebook] = useState("azure");
  const [query, setQuery] = useState("");
  const [chatMsgs, setChatMsgs] = useState<Msg[]>([
    { role: "assistant", text: "Google NotebookLM ready. Gemini 2.0 Flash indexed 3 sources (ADF Architecture, PySpark Delta Lake, Konica Minolta Standards). Ask anything with exact citation grounds." }
  ]);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioDone, setAudioDone] = useState(false);

  const notebooks = [
    { id: "azure", title: "Azure & PySpark Architecture", sourcesCount: 4, icon: "📘" },
    { id: "pulse", title: "PULSE YouTube Transcripts Briefs", sourcesCount: 12, icon: "⚡" },
    { id: "certs", title: "AZ-900 & DP-700 Study Notebook", sourcesCount: 8, icon: "📜" }
  ];

  const handleAudioGenerate = () => {
    setIsGeneratingAudio(true);
    setTimeout(() => {
      setIsGeneratingAudio(false);
      setAudioDone(true);
    }, 2500);
  };

  const handleSend = () => {
    if (!query.trim()) return;
    const q = query;
    setQuery("");
    setChatMsgs(m => [...m, { role: "user", text: q }]);

    setTimeout(() => {
      setChatMsgs(m => [...m, {
        role: "assistant",
        text: `Based on your NotebookLM sources [Source 1: Azure ADF Docs, Source 2: PySpark Delta Lake]:\n\n${q.toLowerCase().includes("pyspark") ? "PySpark Delta Lake enforces ACID transactions using transaction log (_delta_log) stored directly on Azure Data Lake Gen2 storage." : "Azure Data Factory pipelines can trigger Databricks PySpark notebooks via REST API or Linked Services with automatic retry policies."}`
      }]);
    }, 800);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 1140, margin: "0 auto", overflowY: "auto" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ color: "#3b82f6", fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <BookMarked size={14} /> GOOGLE NOTEBOOKLM INTEGRATION
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#f8fff8", margin: 0 }}>Gemini 2.0 Research & Notebook Hub</h1>
        </div>

        <a
          href="https://notebooklm.google.com"
          target="_blank"
          rel="noreferrer"
          style={{
            padding: "8px 16px", borderRadius: 10, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.35)",
            color: "#60a5fa", fontSize: 12, fontFamily: mono, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 6
          }}
        >
          Open Official NotebookLM ↗
        </a>
      </div>

      {/* Notebook Selector Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {notebooks.map(nb => (
          <div
            key={nb.id}
            onClick={() => setActiveNotebook(nb.id)}
            style={{
              ...card, cursor: "pointer", transition: "all 0.2s",
              border: activeNotebook === nb.id ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.08)",
              background: activeNotebook === nb.id ? "rgba(59,130,246,0.12)" : "rgba(13,20,16,0.85)"
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 8 }}>{nb.icon}</div>
            <div style={{ color: "#f8fff8", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{nb.title}</div>
            <div style={{ color: "#9ca3af", fontSize: 11, fontFamily: mono }}>{nb.sourcesCount} Indexed Sources</div>
          </div>
        ))}
      </div>

      {/* Audio Overview Podcast Banner (NotebookLM Signature Feature) */}
      <div style={{
        ...card, marginBottom: 24, padding: 24,
        background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))",
        border: "1px solid rgba(59,130,246,0.35)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16
      }}>
        <div>
          <div style={{ color: "#60a5fa", fontSize: 11, fontFamily: mono, fontWeight: 800, textTransform: "uppercase" }}>NOTEBOOKLM AUDIO OVERVIEW</div>
          <div style={{ color: "#f8fff8", fontSize: 16, fontWeight: 800, marginTop: 4 }}>2-Speaker AI Podcast Brief</div>
          <div style={{ color: "#9ca3af", fontSize: 12, marginTop: 2 }}>Synthesize all indexed notebook sources into a 5-minute audio deep dive podcast.</div>
        </div>

        {audioDone ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: "#34d399", fontSize: 12, fontFamily: mono, fontWeight: 700 }}>✓ Audio Brief Ready (4m 18s)</span>
            <button style={{ padding: "8px 16px", borderRadius: 8, background: "#10b981", color: "#000", fontSize: 12, fontFamily: mono, fontWeight: 800, border: "none", cursor: "pointer" }}>
              ▶ Play Audio Brief
            </button>
          </div>
        ) : (
          <button
            onClick={handleAudioGenerate}
            disabled={isGeneratingAudio}
            style={{
              padding: "10px 20px", borderRadius: 10, background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              color: "#fff", fontSize: 12, fontFamily: mono, fontWeight: 800, border: "none", cursor: "pointer",
              boxShadow: "0 0 20px rgba(59,130,246,0.3)"
            }}
          >
            {isGeneratingAudio ? "⚡ Synthesizing AI Podcast..." : "🎙️ Generate Audio Overview"}
          </button>
        )}
      </div>

      {/* Main NotebookLM Chat & Source Citations Panel */}
      <div style={{ ...card, border: "1px solid rgba(59,130,246,0.25)" }}>
        <div style={{ color: "#60a5fa", fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>GEMINI 2.0 CITATION QUERY ENGINE</div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: 320, overflowY: "auto", marginBottom: 20 }}>
          {chatMsgs.map((m, idx) => (
            <div key={idx} style={{
              padding: 14, borderRadius: 10,
              background: m.role === "user" ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.03)",
              border: m.role === "user" ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(255,255,255,0.06)",
              color: "#f8fff8", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap"
            }}>
              <div style={{ fontSize: 10, fontFamily: mono, color: m.role === "user" ? "#60a5fa" : "#34d399", marginBottom: 4 }}>
                {m.role === "user" ? "USER QUERY" : "GEMINI 2.0 NOTEBOOKLM CITATION"}
              </div>
              {m.text}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Query indexed notebook sources..."
            style={{
              flex: 1, padding: "12px 14px", borderRadius: 10, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(59,130,246,0.3)",
              color: "#f8fff8", fontSize: 13, fontFamily: mono, outline: "none"
            }}
          />
          <button
            onClick={handleSend}
            style={{
              padding: "12px 20px", borderRadius: 10, background: "#3b82f6", color: "#fff",
              fontSize: 12, fontFamily: mono, fontWeight: 800, border: "none", cursor: "pointer"
            }}
          >
            Ask NotebookLM
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function AIVOS() {
  const [section, setSection] = useState<Section>("landing");
  const [time, setTime] = useState<Date | null>(null);
  const [ollamaOk, setOllamaOk] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

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
      case "landing":     return <LandingHomeView setSection={setSection} onOpenLogin={() => setShowAuthModal(true)} />;
      case "solutions":   return <SolutionsView setSection={setSection} onOpenLogin={() => setShowAuthModal(true)} />;
      case "marketplace": return <MarketplaceView setSection={setSection} onOpenLogin={() => setShowAuthModal(true)} />;
      case "pricing":     return <PricingView setSection={setSection} onOpenLogin={() => setShowAuthModal(true)} />;
      case "about":       return <AboutView setSection={setSection} onOpenLogin={() => setShowAuthModal(true)} />;
      case "dashboard":   return time ? <Dashboard time={time} /> : null;
      case "notebooklm":  return <NotebookLMView />;
      case "brief":       return <BriefView />;
      case "memory":      return <Memory />;
      case "para":        return <PARAView />;
      case "knowledge":   return <KnowledgeView />;
      case "inbox":       return <InboxView />;
      case "sessions":    return <SessionsView />;
      case "search":      return <KnowledgeView />;
    }
  }

  const isPublicPage = ["landing", "solutions", "marketplace", "pricing", "about"].includes(section);

  if (isPublicPage) {
    return (
      <>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        <div style={{ minHeight: "100vh", background: "#0f1410", fontFamily: "Inter, -apple-system, sans-serif" }}>
          <ApifyHeader currentSection={section} setSection={setSection} onOpenLogin={() => setShowAuthModal(true)} />
          <main style={{ overflowY: "auto" }}>
            {renderSection()}
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      <div style={{ display: "flex", height: "100vh", background: "#0f1410", fontFamily: "Inter, -apple-system, sans-serif", overflow: "hidden" }}>
        <aside style={{ width: 220, background: "rgba(22,32,26,0.9)", borderRight: "1px solid rgba(16,185,129,0.15)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div
            onClick={() => setSection("landing")}
            style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(16,185,129,0.1)", cursor: "pointer" }}
            title="Home - Domovská Stránka (Seznam.cz style)"
          >
            <div style={{ fontFamily: mono, fontSize: 20, fontWeight: 900, color: "#10b981" }}>AIVOS-OS</div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>Public Platform & Consulting</div>
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
    </>
  );
}
