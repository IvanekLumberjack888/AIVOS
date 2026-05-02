"use client";
import { useState, useEffect, useRef } from "react";
import { LayoutDashboard, Brain, FolderOpen, BookOpen, Inbox, Terminal, Search, Circle } from "lucide-react";

type Section = "dashboard" | "memory" | "para" | "knowledge" | "inbox" | "sessions" | "search";
type MsgRole = "user" | "assistant" | "system";
interface Msg { role: MsgRole; text: string; }

const PROJECTS = [
  { name: "Konica Onboarding",    tag: "WORK",  progress: 42, phase: "Week 5 / 12",      color: "#10b981" },
  { name: "DP-700 Certification", tag: "CERT",  progress: 12, phase: "Study mode",        color: "#34d399" },
  { name: "AIVOS Build",          tag: "BUILD", progress: 8,  phase: "Phase 1",           color: "#6ee7b7" },
  { name: "SwitcherOS",           tag: "WAIT",  progress: 88, phase: "Awaiting approval", color: "#34d399" },
  { name: "yt-brain pipeline",    tag: "STALL", progress: 35, phase: "CZ/SK transcript",  color: "#f59e0b" },
];

const PARA: Record<string, string[]> = {
  "10 PROJEKTY": ["Konica Onboarding", "DP-700 Cert", "AIVOS Build", "SwitcherOS", "yt-brain"],
  "20 OBLASTI":  ["Career & Work", "Learning Data & AI", "Health", "Relationships"],
  "30 ZDROJE":   ["ADF Roadmap", "DP-700 Fabric Forge", "RAG Patterns", "LangChain", "MCP Docs"],
  "40 ARCHIV":   ["Job Search 2025", "data-engineer-journey-2026", "Hedin EXIT"],
};

const PARA_COLORS: Record<string, string> = {
  "10 PROJEKTY": "#10b981",
  "20 OBLASTI":  "#34d399",
  "30 ZDROJE":   "#6ee7b7",
  "40 ARCHIV":   "#6b7280",
};

const NAV = [
  { id: "dashboard" as Section, Icon: LayoutDashboard, label: "Dashboard" },
  { id: "memory"    as Section, Icon: Brain,           label: "Memory"    },
  { id: "para"      as Section, Icon: FolderOpen,      label: "P.A.R.A."  },
  { id: "knowledge" as Section, Icon: BookOpen,        label: "Knowledge" },
  { id: "inbox"     as Section, Icon: Inbox,           label: "Inbox"     },
  { id: "sessions"  as Section, Icon: Terminal,        label: "Sessions"  },
  { id: "search"    as Section, Icon: Search,          label: "Search"    },
];

const cardStyle = {
  background: "rgba(22,32,26,0.85)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(16,185,129,0.2)",
  borderRadius: 16,
  padding: 24,
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={cardStyle}>
      <div style={{ color: "#6b7280", fontSize: 11, fontFamily: "JetBrains Mono, monospace", letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 6 }}>{label}</div>
      <div style={{ color: "#f8fff8", fontSize: 22, fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function Dashboard({ time }: { time: Date }) {
  const konicaDay = Math.max(1, Math.ceil((time.getTime() - new Date("2026-04-01").getTime()) / 86400000));
  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ color: "#6b7280", fontSize: 13, fontFamily: "JetBrains Mono, monospace", marginBottom: 4 }}>
          {time.toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          {" · Konica day " + konicaDay}
        </p>
        <div style={{ color: "#10b981", fontSize: 48, fontWeight: 900, fontFamily: "JetBrains Mono, monospace", lineHeight: 1 }}>
          {time.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })}
          <span style={{ color: "#374151", fontSize: 32 }}>{":" + String(time.getSeconds()).padStart(2, "0")}</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Projects" value="5" />
        <StatCard label="Ollama" value="qwen2.5" />
        <StatCard label="DP-700" value="12%" />
      </div>

      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <div style={{ color: "#10b981", fontSize: 11, fontFamily: "JetBrains Mono, monospace", letterSpacing: 2, marginBottom: 20, textTransform: "uppercase" as const }}>Active Projects</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {PROJECTS.map(p => (
            <div key={p.name}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, border: "1px solid " + p.color, color: p.color, fontFamily: "JetBrains Mono, monospace", letterSpacing: 1 }}>{p.tag}</span>
                  <span style={{ color: "#f8fff8", fontSize: 14, fontWeight: 600 }}>{p.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ color: "#6b7280", fontSize: 12 }}>{p.phase}</span>
                  <span style={{ color: p.color, fontSize: 13, fontFamily: "JetBrains Mono, monospace", fontWeight: 700, minWidth: 36, textAlign: "right" as const }}>{p.progress + "%"}</span>
                </div>
              </div>
              <div style={{ height: 4, background: "rgba(16,185,129,0.1)", borderRadius: 4 }}>
                <div style={{ height: "100%", width: p.progress + "%", background: "linear-gradient(90deg, " + p.color + ", #6ee7b7)", borderRadius: 4, transition: "width 1s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...cardStyle, border: "1px solid rgba(16,185,129,0.4)" }}>
        <div style={{ color: "#10b981", fontSize: 11, fontFamily: "JetBrains Mono, monospace", letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" as const }}>{"Today's Focus"}</div>
        <p style={{ color: "#d1fae5", fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Konica: support tickets + ADF pipeline shadowing</p>
        <p style={{ color: "#6b7280", fontSize: 13 }}>DP-700: 30 min Fabric Forge · AIVOS: Next.js scaffold</p>
      </div>
    </div>
  );
}

function Memory() {
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "system", text: "qwen2.5:7b ready @ localhost:11434 · ctx 32k · temp 0.7" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput("");
    setLoading(true);
    setMsgs(m => [...m, { role: "user", text: q }]);
    try {
      const res = await fetch("/api/ollama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: q }),
      });
      const data = await res.json();
      setMsgs(m => [...m, { role: "assistant", text: data.response ?? data.error ?? "No response" }]);
    } catch {
      setMsgs(m => [...m, { role: "assistant", text: "Cannot reach Ollama at localhost:11434" }]);
    }
    setLoading(false);
  };

  const getBubbleStyle = (role: MsgRole) => ({
    maxWidth: "80%",
    padding: "12px 16px",
    borderRadius: role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
    background: role === "user" ? "rgba(16,185,129,0.2)" : "rgba(22,32,26,0.85)",
    border: "1px solid rgba(16,185,129,0.2)",
    color: role === "system" ? "#6b7280" : "#f8fff8",
    fontSize: 14,
    lineHeight: 1.6,
    whiteSpace: "pre-wrap" as const,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 57px)", maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
      <div style={{ flex: 1, overflowY: "auto", marginBottom: 16 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ marginBottom: 16, display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={getBubbleStyle(m.role)}>{m.text}</div>
          </div>
        ))}
        {loading && <div style={{ color: "#10b981", fontSize: 14 }}>Thinking...</div>}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", gap: 12, padding: 16, background: "rgba(22,32,26,0.85)", borderRadius: 16, border: "1px solid rgba(16,185,129,0.2)" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask your local memory..."
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#f8fff8", fontSize: 14 }}
        />
        <button
          onClick={send}
          disabled={loading}
          style={{ padding: "8px 20px", background: "#10b981", border: "none", borderRadius: 10, color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: loading ? 0.5 : 1 }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

function PARAView() {
  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {Object.entries(PARA).map(([key, items]) => (
          <div key={key} style={cardStyle}>
            <div style={{ color: PARA_COLORS[key], fontSize: 11, fontFamily: "JetBrains Mono, monospace", letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 16 }}>{key}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.1)" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: PARA_COLORS[key], flexShrink: 0 }} />
                  <span style={{ color: "#d1fae5", fontSize: 13 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Placeholder({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <div style={cardStyle}>
        <div style={{ color: "#10b981", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{title}</div>
        <p style={{ color: "#6b7280", fontSize: 14 }}>{desc}</p>
      </div>
    </div>
  );
}

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
    fetch("/api/ollama").then(r => setOllamaOk(r.ok)).catch(() => setOllamaOk(false));
  }, []);

  function renderSection() {
    switch (section) {
      case "dashboard":  return time ? <Dashboard time={time} /> : null;
      case "memory":     return <Memory />;
      case "para":       return <PARAView />;
      case "knowledge":  return <Placeholder title="Knowledge Base" desc="Semantic search via pgvector + Neon — coming in Phase 3." />;
      case "inbox":      return <Placeholder title="Inbox" desc="Gmail MCP integration — coming in Phase 4." />;
      case "sessions":   return <Placeholder title="Sessions" desc="Claude Code + GitHub MCP — coming in Phase 5." />;
      case "search":     return <Placeholder title="Universal Search" desc="Search across Notion, GitHub, Memory, KB — coming in Phase 6." />;
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0f1410", fontFamily: "Inter, -apple-system, sans-serif", overflow: "hidden" }}>
      <aside style={{ width: 220, background: "rgba(22,32,26,0.9)", borderRight: "1px solid rgba(16,185,129,0.15)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(16,185,129,0.1)" }}>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 20, fontWeight: 900, color: "#10b981" }}>AIVOS</div>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>Personal AI OS v0.1</div>
        </div>
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(({ id, Icon, label }) => {
            const active = section === id;
            return (
              <button
                key={id}
                onClick={() => setSection(id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: active ? "rgba(16,185,129,0.15)" : "transparent",
                  color: active ? "#10b981" : "#6b7280",
                  fontWeight: active ? 600 : 400,
                  fontSize: 14, transition: "all 0.2s", textAlign: "left" as const,
                  width: "100%",
                }}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(16,185,129,0.1)", fontSize: 11 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: ollamaOk ? "#10b981" : "#f59e0b", marginBottom: 4 }}>
            <Circle size={6} fill={ollamaOk ? "#10b981" : "#f59e0b"} />
            {"Ollama " + (ollamaOk ? "online" : "offline")}
          </div>
          <div style={{ color: "#4b5563", fontSize: 10 }}>{"© 2026 Ivo Doležal"}</div>
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: "auto" }}>
        <header style={{ padding: "16px 32px", borderBottom: "1px solid rgba(16,185,129,0.1)", background: "rgba(22,32,26,0.6)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ color: "#f8fff8", fontSize: 16, fontWeight: 600 }}>{NAV.find(n => n.id === section)?.label}</div>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "#6b7280" }}>
            {time ? time.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--"}
          </div>
        </header>
        {renderSection()}
      </main>
    </div>
  );
}
