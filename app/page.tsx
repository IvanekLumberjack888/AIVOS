"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { LayoutDashboard, Brain, FolderOpen, BookOpen, Inbox, Terminal, Search, Circle, Tv, X, Send } from "lucide-react";

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

// ─── TYPES ───────────────────────────────────────────────────────────────────

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

// ─── DEEP DIVE CHAT ───────────────────────────────────────────────────────────

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
    const newMsgs = [...msgs, { role: "user" as const, text: q }];
    setMsgs(newMsgs);

    try {
      const res = await fetch("/api/chat-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMsgs, videoContext: video }),
      });
      const data = await res.json();
      setMsgs(m => [...m, { role: "assistant", text: data.text || data.error || "Chyba." }]);
    } catch {
      setMsgs(m => [...m, { role: "assistant", text: "Nepodařilo se spojit s AI." }]);
    }
    setLoading(false);
  };

  const quickPrompts = [
    "Jak to použít v Azure ADF?",
    "Shrň to pro mě jednoduše",
    "Co bych měl vyzkoušet jako první?",
    "Jak to souvisí s DP-700?",
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        width: "min(520px, 100vw)", height: "min(700px, 100vh)",
        background: "#0f1410", borderLeft: "1px solid rgba(16,185,129,0.2)",
        borderTop: "1px solid rgba(16,185,129,0.2)",
        borderRadius: "16px 0 0 0",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(16,185,129,0.15)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#10b981", fontSize: 10, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 4 }}>Deep Dive</div>
            <div style={{ color: "#f8fff8", fontSize: 13, fontWeight: 600, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{video.title}</div>
            <div style={{ color: "#4b5563", fontSize: 11, fontFamily: mono, marginTop: 2 }}>{video.channel}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", padding: 4, flexShrink: 0 }}>
            <X size={18} />
          </button>
        </div>

        {/* Quick prompts */}
        {msgs.length === 0 && (
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(16,185,129,0.1)" }}>
            <div style={{ color: "#4b5563", fontSize: 10, fontFamily: mono, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 8 }}>Rychlé dotazy</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {quickPrompts.map(q => (
                <button key={q} onClick={() => send(q)} style={{
                  padding: "5px 10px", borderRadius: 20,
                  background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
                  color: "#6ee7b7", fontSize: 11, cursor: "pointer", fontFamily: mono,
                  transition: "all 0.15s",
                }}>{q}</button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {msgs.length === 0 && (
            <div style={{ color: "#4b5563", fontSize: 13, textAlign: "center", marginTop: 40 }}>
              Zeptej se na cokoliv k tomuto videu 👆
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={i} style={{
              marginBottom: 12,
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}>
              <div style={{
                maxWidth: "85%", padding: "10px 14px",
                borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                background: m.role === "user" ? "rgba(16,185,129,0.2)" : "rgba(22,32,26,0.9)",
                border: "1px solid rgba(16,185,129,0.2)",
                color: "#f8fff8", fontSize: 13, lineHeight: 1.6,
                whiteSpace: "pre-wrap" as const,
              }}>{m.text}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
              <div style={{ padding: "10px 14px", borderRadius: "14px 14px 14px 4px", background: "rgba(22,32,26,0.9)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981", fontSize: 13 }}>
                ●●● přemýšlím...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(16,185,129,0.15)", display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Zeptej se na toto video..."
            style={{ flex: 1, background: "rgba(22,32,26,0.9)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "10px 14px", color: "#f8fff8", fontSize: 13, outline: "none" }}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()} style={{
            padding: "10px 14px", background: input.trim() ? "#10b981" : "rgba(16,185,129,0.1)",
            border: "none", borderRadius: 10, cursor: input.trim() ? "pointer" : "default",
            color: input.trim() ? "#0f1410" : "#4b5563", transition: "all 0.2s",
          }}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BRIEF VIDEO CARD ─────────────────────────────────────────────────────────

function BriefVideoCard({ video, color }: { video: VideoItem; color: string }) {
  const [open, setOpen] = useState(false);
  const [deepDive, setDeepDive] = useState(false);

  return (
    <>
      {deepDive && <DeepDiveChat video={video} onClose={() => setDeepDive(false)} />}
      <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(16,185,129,0.04)", border: `1px solid ${color}20`, transition: "border-color 0.2s" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" as const }}>
              {video.score && (
                <span style={{ fontSize: 10, fontFamily: mono, color, border: `1px solid ${color}40`, borderRadius: 4, padding: "1px 6px", flexShrink: 0 }}>
                  {video.score}/10
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
            <button onClick={() => setDeepDive(true)} style={{
              padding: "4px 10px", borderRadius: 6,
              background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
              color: "#10b981", fontSize: 10, fontFamily: mono, cursor: "pointer",
              letterSpacing: 1, textTransform: "uppercase" as const,
              transition: "all 0.15s",
            }}>
              Deep Dive
            </button>
            <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: 14, padding: "0 4px" }}>
              {open ? "▲" : "▼"}
            </button>
          </div>
        </div>
        {open && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${color}15` }}>
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
    </>
  );
}

// ─── BRAIN BRIEF ─────────────────────────────────────────────────────────────

function BriefView() {
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("latest");
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);

  const loadBrief = useCallback((dateKey: string) => {
    const url = dateKey === "latest" ? "/briefs/latest.json" : `/briefs/${dateKey}.json`;
    fetch(url)
      .then(r => { if (!r.ok) throw new Error("404"); return r.json(); })
      .then(data => { setBrief(data); setError(""); })
      .catch(() => setError("Brief pro toto datum není k dispozici."));
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

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>

      {brief && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "HIGH",  val: brief.stats.high,   color: "#10b981" },
            { label: "MED",   val: brief.stats.medium, color: "#f59e0b" },
            { label: "SKIP",  val: brief.stats.low,    color: "#4b5563" },
            { label: "TOTAL", val: brief.stats.total,  color: "#6ee7b7" },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ ...card, padding: "14px 0", textAlign: "center" }}>
              <div style={{ color, fontSize: 22, fontFamily: mono, fontWeight: 700 }}>{val}</div>
              <div style={{ color: "#4b5563", fontSize: 9, fontFamily: mono, letterSpacing: 1, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ ...card, marginBottom: 20 }}>
        <audio ref={audioRef} src={audioSrc} preload="metadata" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ color: "#4b5563", fontSize: 10, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 2 }}>Brain Brief Podcast</div>
            <div style={{ color: "#f8fff8", fontSize: 16, fontFamily: mono, fontWeight: 700 }}>{brief?.date ?? "Načítám..."}</div>
          </div>
          <button onClick={togglePlay} style={{
            width: 52, height: 52, borderRadius: "50%",
            background: playing ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.9)",
            border: `1px solid ${playing ? "#10b981" : "transparent"}`,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, color: playing ? "#10b981" : "#0f1410", transition: "all 0.2s",
          }}>
            {playing ? "⏸" : "▶"}
          </button>
        </div>
        <input type="range" min={0} max={duration || 100} value={progress} onChange={seek}
          style={{
            width: "100%", appearance: "none" as const, height: 3, borderRadius: 2,
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
          <div style={{ color: "#10b981", fontSize: 10, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 12 }}>● High relevance</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {brief.high.map((v, i) => <BriefVideoCard key={i} video={v} color="#10b981" />)}
          </div>
        </div>
      )}

      {brief && brief.medium.length > 0 && (
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ color: "#f59e0b", fontSize: 10, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 12 }}>● Medium</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {brief.medium.slice(0, 8).map((v, i) => <BriefVideoCard key={i} video={v} color="#f59e0b" />)}
          </div>
        </div>
      )}

      {history.length > 1 && (
        <div style={card}>
          <div style={{ color: "#4b5563", fontSize: 10, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 12 }}>Historie</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {history.map(d => (
              <button key={d} onClick={() => switchDate(d)} style={{
                padding: "4px 12px", borderRadius: 20,
                background: selectedDate === d ? "rgba(16,185,129,0.2)" : "transparent",
                border: `1px solid ${selectedDate === d ? "#10b981" : "rgba(16,185,129,0.2)"}`,
                color: selectedDate === d ? "#10b981" : "#6b7280",
                fontSize: 11, fontFamily: mono, cursor: "pointer",
              }}>{d}</button>
            ))}
          </div>
        </div>
      )}

      {error && <div style={{ color: "#ef4444", fontSize: 13, marginTop: 16 }}>{error}</div>}
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
  const konicaDay = Math.max(1, Math.ceil((time.getTime() - new Date("2026-04-01").getTime()) / 86400000));
  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ color: "#6b7280", fontSize: 13, fontFamily: mono, marginBottom: 4 }}>
          {time.toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          {" · Konica day " + konicaDay}
        </p>
        <div style={{ color: "#10b981", fontSize: 48, fontWeight: 900, fontFamily: mono, lineHeight: 1 }}>
          {time.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })}
          <span style={{ color: "#374151", fontSize: 32 }}>{":" + String(time.getSeconds()).padStart(2, "0")}</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Projects" value="5" />
        <StatCard label="Ollama" value="qwen2.5" />
        <StatCard label="DP-700" value="12%" />
      </div>
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ color: "#10b981", fontSize: 11, fontFamily: mono, letterSpacing: 2, marginBottom: 20, textTransform: "uppercase" as const }}>Active Projects</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {PROJECTS.map(p => (
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
          ))}
        </div>
      </div>
      <div style={{ ...card, border: "1px solid rgba(16,185,129,0.4)" }}>
        <div style={{ color: "#10b981", fontSize: 11, fontFamily: mono, letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" as const }}>{"Today's Focus"}</div>
        <p style={{ color: "#d1fae5", fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Konica: support tickets + ADF pipeline shadowing</p>
        <p style={{ color: "#6b7280", fontSize: 13 }}>DP-700: 30 min Fabric Forge · AIVOS: Next.js scaffold</p>
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
  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {Object.entries(PARA).map(([key, items]) => (
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
        ))}
      </div>
    </div>
  );
}

function Placeholder({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <div style={card}>
        <div style={{ color: "#10b981", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{title}</div>
        <p style={{ color: "#6b7280", fontSize: 14 }}>{desc}</p>
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
    fetch("/api/ollama").then(r => setOllamaOk(r.ok)).catch(() => setOllamaOk(false));
  }, []);

  function renderSection() {
    switch (section) {
      case "dashboard":  return time ? <Dashboard time={time} /> : null;
      case "brief":      return <BriefView />;
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
          <div style={{ fontFamily: mono, fontSize: 20, fontWeight: 900, color: "#10b981" }}>AIVOS</div>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>Personal AI OS v0.1</div>
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
          <div style={{ fontFamily: mono, fontSize: 13, color: "#6b7280" }}>
            {time ? time.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--"}
          </div>
        </header>
        {renderSection()}
      </main>
    </div>
  );
}
