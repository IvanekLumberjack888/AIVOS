"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { LayoutDashboard, Brain, FolderOpen, BookOpen, Inbox, Terminal, Search, Circle, Tv, X, Send, Sparkles, Plus, CheckCircle2, CircleDot, Link as LinkIcon, FileText, CheckSquare } from "lucide-react";

type Section = "dashboard" | "memory" | "para" | "knowledge" | "inbox" | "sessions" | "search" | "brief";
type MsgRole = "user" | "assistant" | "system";
interface Msg { role: MsgRole; text: string; }

// Public Showcase Demo Projects (No internal/private company data)
const DEMO_PROJECTS = [
  { name: "Enterprise Cloud Integration", tag: "WORK",  progress: 65, phase: "Phase 2 / 4",       color: "#10b981" },
  { name: "Be certified (AZ-900, etc)", tag: "CERT",  progress: 60, phase: "Self-developing",    color: "#34d399" },
  { name: "AIVOS Platform Build",       tag: "BUILD", progress: 25, phase: "Phase 1 Scaffold",   color: "#6ee7b7" },
  { name: "Power BI Analytics",         tag: "DONE",  progress: 100, phase: "Completed",        color: "#34d399" },
  { name: "yt-brain RAG Pipeline",      tag: "DEV",   progress: 50, phase: "Transcripts & LLM",  color: "#f59e0b" },
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
        newM[newM.length - 1] = { role: "assistant", text: "Nepodařilo se spojit s AI službou Gemini." };
        return newM;
      });
    }
    setLoading(false);
  };

  const quickPrompts = [
    "Jak to použít v Azure ADF?",
    "Shrň to pro mě jednoduše",
    "Co bych měl vyzkoušet jako první?",
    "Jak to využít pro certifikace (AZ-900, etc)?",
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
          <div style={{ color: "#4b5563", fontSize: 10, fontFamily: mono, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 8 }}>Rychlé dotazy</div>
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
            Zeptej se na cokoliv k tomuto videu 👆
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
            }}>{m.text || (loading && i === msgs.length - 1 ? "Generuji odpověď..." : "")}</div>
          </div>
        ))}
        {loading && <div style={{ color: "#10b981", fontSize: 11, fontFamily: mono, marginTop: 4 }}>● Streamování tokenů skrze Gemini 2.0 Flash...</div>}
        <div ref={endRef} />
      </div>

      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(16,185,129,0.15)", display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Napiš dotaz..."
          style={{ flex: 1, background: "rgba(22,32,26,0.8)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8, padding: "8px 12px", color: "#f8fff8", fontSize: 13, outline: "none" }} />
        <button onClick={() => send()} disabled={loading} style={{ padding: "8px 14px", background: "#10b981", border: "none", borderRadius: 8, color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── BRIEF VIDEO CARD ────────────────────────────────────────────────────────

function BriefVideoCard({ video, color, onDeepDive }: { video: VideoItem; color: string; onDeepDive: (v: VideoItem) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ ...card, padding: 14, borderColor: `${color}30` }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            {video.score && (
              <span style={{ fontSize: 10, fontFamily: mono, color, background: `${color}15`, padding: "1px 6px", borderRadius: 4, border: `1px solid ${color}30` }}>
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
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
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
  const panelOpen = activeVideo !== null;

  return (
    <>
      {panelOpen && <DeepDiveChat video={activeVideo!} onClose={() => setActiveVideo(null)} />}
      <div style={{
        padding: "2rem",
        marginRight: panelOpen ? 496 : 0,
        transition: "margin-right 0.3s ease",
      }}>
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
              {brief.high.map((v, i) => <BriefVideoCard key={i} video={v} color="#10b981" onDeepDive={setActiveVideo} />)}
            </div>
          </div>
        )}

        {brief && brief.medium.length > 0 && (
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ color: "#f59e0b", fontSize: 10, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 12 }}>● Medium</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {brief.medium.slice(0, 8).map((v, i) => <BriefVideoCard key={i} video={v} color="#f59e0b" onDeepDive={setActiveVideo} />)}
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
              placeholder="Vyhledat v architektuře, PySpark, ADF, Gemini, RAG..."
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
                  {isExpanded ? "Zavřít" : "Detail"}
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
            placeholder={type === "youtube" ? "Vlož YouTube URL odkaz..." : type === "task" ? "Nová úloha / zaměření..." : "Rychlá poznámka..."}
            style={{
              flex: 1, background: "rgba(10,15,10,0.8)", border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: 10, padding: "10px 14px", color: "#f8fff8", fontSize: 14, outline: "none"
            }}
          />
          <button onClick={addItem} disabled={loading} style={{
            padding: "10px 20px", background: "#10b981", border: "none", borderRadius: 10,
            color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6
          }}>
            <Plus size={16} /> Přidat
          </button>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {[
            { id: "task" as const, label: "Úloha", Icon: CheckSquare },
            { id: "youtube" as const, label: "YouTube Link", Icon: LinkIcon },
            { id: "note" as const, label: "Poznámka", Icon: FileText },
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
        <div style={{ color: "#10b981", fontSize: 11, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Doručená Pošta ({items.length})</div>
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
      case "sessions":   return <Placeholder title="Sessions" desc="Claude Code + GitHub MCP — coming in Phase 5." />;
      case "search":     return <KnowledgeView />;
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0f1410", fontFamily: "Inter, -apple-system, sans-serif", overflow: "hidden" }}>
      <aside style={{ width: 220, background: "rgba(22,32,26,0.9)", borderRight: "1px solid rgba(16,185,129,0.15)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(16,185,129,0.1)" }}>
          <div style={{ fontFamily: mono, fontSize: 20, fontWeight: 900, color: "#10b981" }}>AIVOS</div>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>Personal AI OS v0.2</div>
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
            {time ? time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) : "--:--:--"}
          </div>
        </header>
        {renderSection()}
      </main>
    </div>
  );
}
