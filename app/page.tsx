"use client";
import { useState, useEffect, useRef } from "react";
import { LayoutDashboard, Brain, FolderOpen, BookOpen, Inbox, Terminal, Search, Tv } from "lucide-react";
import { BriefView } from "./components/BriefView";

type Section = "dashboard" | "memory" | "para" | "knowledge" | "inbox" | "sessions" | "search" | "brief";
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
  { id: "brief"     as Section, Icon: Tv,              label: "Brain Brief" },
  { id: "memory"    as Section, Icon: Brain,           label: "Memory" },
  { id: "para"      as Section, Icon: FolderOpen,      label: "P.A.R.A." },
  { id: "knowledge" as Section, Icon: BookOpen,        label: "Knowledge" },
  { id: "inbox"     as Section, Icon: Inbox,           label: "Inbox" },
  { id: "sessions"  as Section, Icon: Terminal,        label: "Sessions" },
  { id: "search"    as Section, Icon: Search,          label: "Search" },
];

const card = {
  background: "rgba(22,32,26,0.85)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(16,185,129,0.2)",
  borderRadius: 16,
  padding: 24,
};

const mono = "JetBrains Mono, monospace";

// ─── Memory ───────────────────────────────────────────────────────────────────

function Memory() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "system", text: "qwen2.5:7b ready @ localhost:11434 · ctx 32k · temp 0.7" },
  ]);
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

  const bubble = (role: MsgRole) => ({
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
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 16 }}>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={bubble(m.role)}>{m.text}</div>
          </div>
        ))}
        {loading && <div style={{ color: "#6b7280", fontSize: 12, fontFamily: mono }}>Thinking...</div>}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", gap: 8, padding: "12px 16px", background: "rgba(22,32,26,0.85)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask your local memory..."
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#f8fff8", fontSize: 14 }}
        />
        <button onClick={send} style={{ background: "#10b981", border: "none", borderRadius: 8, padding: "6px 14px", color: "#0f1410", cursor: "pointer", fontWeight: 600 }}>Send</button>
      </div>
    </div>
  );
}

// ─── PARA ─────────────────────────────────────────────────────────────────────

function PARAView() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
      {Object.entries(PARA).map(([key, items]) => (
        <div key={key} style={{ ...card }}>
          <div style={{ fontSize: 11, fontFamily: mono, color: PARA_COLORS[key], letterSpacing: 1, marginBottom: 12 }}>{key}</div>
          {items.map(item => (
            <div key={item} style={{ fontSize: 13, color: "#9ca3af", padding: "4px 0", borderBottom: "1px solid rgba(16,185,129,0.06)" }}>{item}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Placeholder ──────────────────────────────────────────────────────────────

function Placeholder({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 8 }}>
      <div style={{ fontSize: 18, color: "#10b981", fontFamily: mono }}>{title}</div>
      <div style={{ fontSize: 13, color: "#6b7280" }}>{desc}</div>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ ...card, padding: "16px 20px" }}>
      <div style={{ fontSize: 11, color: "#6b7280", fontFamily: mono, letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, color: "#10b981", fontWeight: 700, fontFamily: mono }}>{value}</div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ time }: { time: Date }) {
  const konicaDay = Math.max(1, Math.ceil((time.getTime() - new Date("2026-04-01").getTime()) / 86400000));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ ...card }}>
        <div style={{ fontSize: 15, color: "#10b981", fontFamily: mono, marginBottom: 4 }}>
          {time.toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          {" · Konica day " + konicaDay}
        </div>
        <div style={{ fontSize: 32, color: "#f8fff8", fontFamily: mono, fontWeight: 700 }}>
          {time.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })}
          <span style={{ fontSize: 18, color: "#6b7280" }}>{":" + String(time.getSeconds()).padStart(2, "0")}</span>
        </div>
      </div>

      <div style={{ ...card }}>
        <div style={{ fontSize: 11, color: "#6b7280", fontFamily: mono, letterSpacing: 1, marginBottom: 16 }}>Active Projects</div>
        {PROJECTS.map(p => (
          <div key={p.name} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: "#f8fff8" }}>
                <span style={{ fontSize: 10, color: p.color, fontFamily: mono, marginRight: 8 }}>{p.tag}</span>
                {p.name}
              </span>
              <span style={{ fontSize: 11, color: "#6b7280", fontFamily: mono }}>{p.phase} · {p.progress}%</span>
            </div>
            <div style={{ height: 3, background: "rgba(16,185,129,0.1)", borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${p.progress}%`, background: p.color, borderRadius: 2, transition: "width 0.5s" }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...card }}>
        <div style={{ fontSize: 11, color: "#6b7280", fontFamily: mono, letterSpacing: 1, marginBottom: 12 }}>{"Today's Focus"}</div>
        <div style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.8 }}>
          Konica: support tickets + ADF pipeline shadowing<br />
          DP-700: 30 min Fabric Forge · AIVOS: Next.js scaffold
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

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
      case "dashboard": return time ? <Dashboard time={time} /> : null;
      case "brief":     return <BriefView />;
      case "memory":    return <Memory />;
      case "para":      return <PARAView />;
      case "knowledge": return <Placeholder title="Knowledge" desc="Roadmapy, snippets, zdroje." />;
      case "inbox":     return <Placeholder title="Inbox" desc="00 FEED – rychlé zachycení." />;
      case "sessions":  return <Placeholder title="Sessions" desc="Log práce a učení." />;
      case "search":    return <Placeholder title="Search" desc="Sémantické vyhledávání." />;
    }
  }

  return (
    <div style={{
      display: "flex", height: "100vh", background: "#0A1410",
      color: "#f8fff8", fontFamily: "JetBrains Mono, monospace",
    }}>
      {/* Sidebar */}
      <aside style={{
        width: 200, flexShrink: 0, padding: "24px 12px",
        borderRight: "1px solid rgba(16,185,129,0.1)",
        display: "flex", flexDirection: "column", gap: 4,
      }}>
        <div style={{ padding: "0 8px 20px" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#10b981" }}>AIVOS</div>
          <div style={{ fontSize: 10, color: "#4b5563", letterSpacing: 1 }}>Personal AI OS v0.1</div>
        </div>
        {NAV.map(({ id, Icon, label }) => {
          const active = section === id;
          return (
            <button key={id} onClick={() => setSection(id)} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 14px", borderRadius: 10, border: "none",
              cursor: "pointer",
              background: active ? "rgba(16,185,129,0.15)" : "transparent",
              color: active ? "#10b981" : "#6b7280",
              fontWeight: active ? 600 : 400,
              fontSize: 14, transition: "all 0.2s",
              textAlign: "left", width: "100%",
            }}>
              <Icon size={16} />
              {label}
            </button>
          );
        })}
        <div style={{ marginTop: "auto", padding: "12px 8px 0", borderTop: "1px solid rgba(16,185,129,0.1)" }}>
          <div style={{ fontSize: 10, color: ollamaOk ? "#10b981" : "#6b7280" }}>
            {"Ollama " + (ollamaOk ? "online" : "offline")}
          </div>
          <div style={{ fontSize: 10, color: "#4b5563", marginTop: 4 }}>{"© 2026 Ivo Doležal"}</div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: "auto", padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: "#f8fff8", margin: 0 }}>
            {NAV.find(n => n.id === section)?.label}
          </h1>
          <div style={{ fontSize: 13, color: "#4b5563", fontFamily: mono }}>
            {time ? time.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--"}
          </div>
        </div>
        {renderSection()}
      </main>
    </div>
  );
}
