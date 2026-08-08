"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Send, X, Play, Pause, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";

// ─── Types ────────────────────────────────────────────────────────────────────

type VideoItem = {
  title: string;
  channel: string;
  url: string;
  summary: string;
  action: string;
  tags: string;
  score?: number;
  key_points?: string[];
  source?: string; // "YouTube" | "Newsletter" (volitelné, default YouTube)
};

type BriefData = {
  date: string;
  text: string;
  stats: { high: number; medium: number; low: number; total: number };
  high: VideoItem[];
  medium: VideoItem[];
  has_audio?: boolean;
};

type Filter = "all" | "high" | "medium" | "done";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mono = "JetBrains Mono, monospace";

function getVideoId(url: string): string {
  return url.split("v=")[1]?.split("&")[0] ?? "";
}

function isYouTube(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function getThumbnail(url: string): string {
  return `https://img.youtube.com/vi/${getVideoId(url)}/mqdefault.jpg`;
}

// Doména článku jako label pro newsletter karty (medium.com, dev.to...)
function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "link";
  }
}

function fmt(s: number): string {
  if (!s || isNaN(s)) return "0:00";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

// ─── Deep Dive Chat ───────────────────────────────────────────────────────────

function DeepDiveChat({ video, onClose }: { video: VideoItem; onClose: () => void }) {
  const [msgs, setMsgs] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

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
      setMsgs((m) => [...m, { role: "assistant", text: data.text || data.error || "Chyba." }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", text: "Nepodařilo se spojit s AI." }]);
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
      background: "rgba(5,12,8,0.85)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }}>
      <div style={{
        width: "100%", maxWidth: 600, maxHeight: "85vh",
        background: "#0d1f16", border: "1px solid rgba(0,229,160,0.25)",
        borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid rgba(0,229,160,0.12)",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 11, color: "#00E5A0", fontFamily: mono, letterSpacing: 1, marginBottom: 4 }}>
              DEEP DIVE
            </div>
            <div style={{ fontSize: 13, color: "#e8f5ee", fontWeight: 500, lineHeight: 1.4 }}>{video.title}</div>
            <div style={{ fontSize: 11, color: "#4b7a5e", marginTop: 2 }}>{video.channel}</div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#4b7a5e",
            cursor: "pointer", padding: 4, flexShrink: 0,
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {msgs.length === 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
              {quickPrompts.map((q) => (
                <button key={q} onClick={() => send(q)} style={{
                  padding: "6px 12px", borderRadius: 20,
                  background: "rgba(0,229,160,0.06)", border: "1px solid rgba(0,229,160,0.2)",
                  color: "#6ee7b7", fontSize: 11, cursor: "pointer", fontFamily: mono,
                }}>{q}</button>
              ))}
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%", padding: "10px 14px", borderRadius: 12,
              background: m.role === "user" ? "rgba(0,229,160,0.15)" : "rgba(22,42,30,0.9)",
              border: "1px solid rgba(0,229,160,0.15)",
              color: "#e8f5ee", fontSize: 13, lineHeight: 1.6,
            }}>
              {m.role === "user" ? m.text : (
                <ReactMarkdown components={{
                  p: ({children}) => <p style={{margin: "0 0 6px"}}>{children}</p>,
                  h2: ({children}) => <h2 style={{fontSize: 14, color: "#00E5A0", margin: "10px 0 4px", fontFamily: mono}}>{children}</h2>,
                  h3: ({children}) => <h3 style={{fontSize: 13, color: "#6ee7b7", margin: "8px 0 4px"}}>{children}</h3>,
                  ul: ({children}) => <ul style={{margin: "4px 0", paddingLeft: 16}}>{children}</ul>,
                  li: ({children}) => <li style={{marginBottom: 3, color: "#8cb89e"}}>{children}</li>,
                  strong: ({children}) => <strong style={{color: "#e8f5ee", fontWeight: 600}}>{children}</strong>,
                  hr: () => <hr style={{border: "none", borderTop: "1px solid rgba(0,229,160,0.1)", margin: "8px 0"}} />,
                  code: ({children}) => <code style={{background: "rgba(0,229,160,0.08)", padding: "1px 6px", borderRadius: 4, fontSize: 11, fontFamily: mono, color: "#00E5A0"}}>{children}</code>,
                }}>{m.text}</ReactMarkdown>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: "flex-start", color: "#4b7a5e", fontSize: 12, fontFamily: mono }}>
              ●●● přemýšlím...
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: "12px 16px", borderTop: "1px solid rgba(0,229,160,0.12)",
          display: "flex", gap: 8,
        }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Zeptej se na toto video..."
            style={{
              flex: 1, background: "rgba(22,42,30,0.6)",
              border: "1px solid rgba(0,229,160,0.2)", borderRadius: 10,
              padding: "10px 14px", color: "#e8f5ee", fontSize: 13, outline: "none",
              fontFamily: mono,
            }}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()} style={{
            padding: "10px 14px",
            background: input.trim() ? "#00E5A0" : "rgba(0,229,160,0.1)",
            border: "none", borderRadius: 10,
            cursor: input.trim() ? "pointer" : "default",
            color: input.trim() ? "#0a1410" : "#4b7a5e",
            transition: "all 0.2s",
          }}>
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Video Card ───────────────────────────────────────────────────────────────

function VideoCard({
  video, tier, done, onToggleDone,
}: {
  video: VideoItem;
  tier: "high" | "medium";
  done: boolean;
  onToggleDone: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [deepDive, setDeepDive] = useState(false);
  const hasContent = video.summary || (video.key_points && video.key_points.length > 0);
  const isVideo = isYouTube(video.url);

  return (
    <>
      {deepDive && <DeepDiveChat video={video} onClose={() => setDeepDive(false)} />}
      <div style={{
        background: done ? "rgba(10,20,13,0.4)" : "rgba(13,26,18,0.9)",
        border: `1px solid ${done ? "rgba(0,229,160,0.06)" : tier === "high" ? "rgba(0,229,160,0.2)" : "rgba(0,229,160,0.1)"}`,
        borderRadius: 12, overflow: "hidden",
        opacity: done ? 0.5 : 1,
        transition: "all 0.2s",
      }}>
        {/* Thumbnail (video) NEBO article header (newsletter) */}
        <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#0a1410", overflow: "hidden" }}>
          {isVideo ? (
            <img
              src={getThumbnail(video.url)}
              alt=""
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div style={{
              width: "100%", height: "100%",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 6,
              background: "linear-gradient(135deg, rgba(0,229,160,0.08), rgba(13,26,18,0.95))",
            }}>
              <span style={{ fontSize: 24 }}>📰</span>
              <span style={{ fontSize: 10, color: "#4b7a5e", fontFamily: mono, letterSpacing: 1 }}>
                {getDomain(video.url)}
              </span>
            </div>
          )}
          {/* Score badge */}
          <div style={{
            position: "absolute", top: 8, right: 8,
            fontSize: 10, fontFamily: mono, fontWeight: 600,
            padding: "2px 8px", borderRadius: 20,
            background: tier === "high" ? "rgba(0,229,160,0.85)" : "rgba(100,100,80,0.85)",
            color: tier === "high" ? "#0a1410" : "#e8f5ee",
          }}>
            {tier === "high" ? "HIGH" : "MED"} {video.score && `· ${video.score}`}
          </div>
          {/* Source type badge (vlevo nahoře) */}
          <div style={{
            position: "absolute", top: 8, left: 8,
            fontSize: 9, fontFamily: mono, fontWeight: 600, letterSpacing: 0.5,
            padding: "2px 7px", borderRadius: 20,
            background: "rgba(0,0,0,0.55)",
            color: isVideo ? "#ff6b6b" : "#6ee7b7",
          }}>
            {isVideo ? "▶ YT" : "✎ READ"}
          </div>
          {/* Bulk badge (purple) */}
          {(video.category === "BULK" || video.tags?.includes("BULK")) && (
            <div style={{
              position: "absolute", top: 8, left: 62,
              fontSize: 9, fontFamily: mono, fontWeight: 700, letterSpacing: 0.5,
              padding: "2px 8px", borderRadius: 20,
              background: "linear-gradient(135deg, #8b5cf6, #c084fc)",
              color: "#ffffff",
              boxShadow: "0 0 8px rgba(168, 85, 247, 0.6)",
            }}>
              🔮 BULK
            </div>
          )}
          {/* Link overlay */}
          <a href={video.url} target="_blank" rel="noreferrer" style={{
            position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0)", transition: "background 0.2s",
            textDecoration: "none",
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.35)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0)"; }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(0,229,160,0.9)", display: "flex",
              alignItems: "center", justifyContent: "center",
              opacity: 0, transition: "opacity 0.2s",
            }} className="play-icon">
              <Play size={14} fill="#0a1410" color="#0a1410" />
            </div>
          </a>
        </div>

        {/* Body */}
        <div style={{ padding: "10px 12px 12px" }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: "#e8f5ee",
            lineHeight: 1.4, marginBottom: 4,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {video.title}
          </div>
          <div style={{ fontSize: 11, color: "#4b7a5e", marginBottom: 10, fontFamily: mono }}>
            {video.channel}
          </div>

          {/* Actions row */}
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setDeepDive(true)} style={{
              flex: 1, fontSize: 10, padding: "5px 0", borderRadius: 6,
              background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)",
              color: "#00E5A0", cursor: "pointer", fontFamily: mono, letterSpacing: 0.5,
            }}>
              DEEP DIVE
            </button>
            {hasContent && (
              <button onClick={() => setExpanded(!expanded)} style={{
                padding: "5px 8px", borderRadius: 6,
                background: "transparent", border: "1px solid rgba(0,229,160,0.12)",
                color: "#4b7a5e", cursor: "pointer",
              }}>
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
            <button onClick={onToggleDone} style={{
              padding: "5px 8px", borderRadius: 6,
              background: done ? "rgba(0,229,160,0.1)" : "transparent",
              border: `1px solid ${done ? "rgba(0,229,160,0.3)" : "rgba(0,229,160,0.12)"}`,
              color: done ? "#00E5A0" : "#4b7a5e", cursor: "pointer", fontSize: 11,
            }}>
              {done ? "✓" : "○"}
            </button>
          </div>

          {/* Expandable summary */}
          {expanded && hasContent && (
            <div style={{
              marginTop: 10, paddingTop: 10,
              borderTop: "1px solid rgba(0,229,160,0.08)",
            }}>
              {video.summary && (
                <p style={{ fontSize: 11, color: "#8cb89e", lineHeight: 1.6, margin: "0 0 8px" }}>
                  {video.summary}
                </p>
              )}
              {video.key_points && video.key_points.length > 0 && (
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {video.key_points.map((kp, i) => (
                    <li key={i} style={{ fontSize: 11, color: "#6b9e7e", lineHeight: 1.5, paddingLeft: 12, position: "relative", marginBottom: 2 }}>
                      <span style={{ position: "absolute", left: 0, color: "#00E5A0" }}>·</span>
                      {kp}
                    </li>
                  ))}
                </ul>
              )}
              {video.action && video.action !== "N/A" && (
                <div style={{
                  marginTop: 8, fontSize: 10, color: "#00E5A0", fontFamily: mono,
                  padding: "4px 8px", background: "rgba(0,229,160,0.06)",
                  borderRadius: 6, borderLeft: "2px solid #00E5A0",
                }}>
                  → {video.action}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Audio Player ─────────────────────────────────────────────────────────────

function AudioPlayer({ src }: { src: string }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setProgress(audio.currentTime);
    const onDur = () => setDuration(audio.duration);
    const onEnd = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onDur);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onDur);
      audio.removeEventListener("ended", onEnd);
    };
  }, [src]);

  const toggle = () => {
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

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 16px",
      background: "rgba(0,229,160,0.04)",
      border: "1px solid rgba(0,229,160,0.12)",
      borderRadius: 10,
    }}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <button onClick={toggle} style={{
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
        background: "#00E5A0", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {playing ? <Pause size={13} fill="#0a1410" color="#0a1410" /> : <Play size={13} fill="#0a1410" color="#0a1410" />}
      </button>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="range" min={0} max={duration || 100} value={progress}
          onChange={seek}
          style={{ flex: 1, accentColor: "#00E5A0", height: 3, cursor: "pointer" }}
        />
        <span style={{ fontSize: 10, color: "#4b7a5e", fontFamily: mono, whiteSpace: "nowrap" }}>
          {fmt(progress)} / {fmt(duration)}
        </span>
      </div>
    </div>
  );
}

// ─── Main BriefView ───────────────────────────────────────────────────────────

export function BriefView() {
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("latest");
  const [filter, setFilter] = useState<Filter>("all");
  const [done, setDone] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  // Load done state from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("bf_done") || "[]");
      setDone(new Set(saved));
    } catch {}
  }, []);

  const saveDone = (next: Set<string>) => {
    setDone(new Set(next));
    localStorage.setItem("bf_done", JSON.stringify([...next]));
  };

  const toggleDone = (url: string) => {
    const next = new Set(done);
    if (next.has(url)) next.delete(url);
    else next.add(url);
    saveDone(next);
  };

  const loadBrief = useCallback((dateKey: string) => {
    const url = dateKey === "latest" ? "/briefs/latest.json" : `/briefs/${dateKey}.json`;
    fetch(url)
      .then((r) => { if (!r.ok) throw new Error("404"); return r.json(); })
      .then((data) => { setBrief(data); setError(""); })
      .catch(() => setError("Brief pro toto datum není k dispozici."));
  }, []);

  useEffect(() => {
    loadBrief("latest");
    fetch("/briefs/index.json").then((r) => r.json()).then(setHistory).catch(() => {});
  }, [loadBrief]);

  const switchDate = (d: string) => {
    setSelectedDate(d);
    loadBrief(d);
  };

  // Build filtered video list
  const allVideos = [
    ...(brief?.high ?? []).map((v) => ({ ...v, tier: "high" as const })),
    ...(brief?.medium ?? []).map((v) => ({ ...v, tier: "medium" as const })),
  ];

  const filtered = allVideos.filter((v) => {
    if (filter === "high") return v.tier === "high";
    if (filter === "medium") return v.tier === "medium";
    if (filter === "done") return done.has(v.url);
    return true;
  });

  const doneCount = allVideos.filter((v) => done.has(v.url)).length;
  const audioSrc = selectedDate === "latest"
    ? "/briefs/latest_brief.mp3"
    : `/briefs/${selectedDate}_brief.mp3`;

  const filterBtn = (f: Filter, label: string, count: number) => (
    <button
      onClick={() => setFilter(f)}
      style={{
        fontSize: 11, padding: "4px 14px", borderRadius: 20, cursor: "pointer",
        fontFamily: mono, letterSpacing: 0.5, transition: "all 0.15s",
        background: filter === f ? "rgba(0,229,160,0.12)" : "transparent",
        border: `1px solid ${filter === f ? "rgba(0,229,160,0.4)" : "rgba(0,229,160,0.12)"}`,
        color: filter === f ? "#00E5A0" : "#4b7a5e",
      }}
    >
      {label}
      <span style={{
        marginLeft: 6, fontSize: 10,
        background: "rgba(0,229,160,0.08)", padding: "1px 6px", borderRadius: 10,
        color: "#4b7a5e",
      }}>{count}</span>
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Stats row */}
      {brief && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { label: "HIGH", val: brief.stats.high, color: "#00E5A0" },
            { label: "MED", val: brief.stats.medium, color: "#f59e0b" },
            { label: "SKIP", val: brief.stats.low, color: "#4b5563" },
            { label: "TOTAL", val: brief.stats.total, color: "#6ee7b7" },
            { label: "DONE", val: doneCount, color: "#00E5A0" },
          ].map(({ label, val, color }) => (
            <div key={label} style={{
              padding: "6px 14px", borderRadius: 8,
              background: "rgba(13,26,18,0.8)", border: "1px solid rgba(0,229,160,0.1)",
              display: "flex", alignItems: "baseline", gap: 6,
            }}>
              <span style={{ fontSize: 18, fontWeight: 700, color, fontFamily: mono }}>{val}</span>
              <span style={{ fontSize: 9, color: "#4b7a5e", letterSpacing: 1 }}>{label}</span>
            </div>
          ))}
          {brief.date && (
            <div style={{
              marginLeft: "auto", fontSize: 11, color: "#4b7a5e",
              fontFamily: mono, alignSelf: "center",
            }}>
              {brief.date}
            </div>
          )}
        </div>
      )}

      {/* Audio player */}
      <AudioPlayer src={audioSrc} />

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        {filterBtn("all", "ALL", allVideos.length)}
        {filterBtn("high", "HIGH", brief?.stats.high ?? 0)}
        {filterBtn("medium", "MED", brief?.stats.medium ?? 0)}
        {filterBtn("done", "DONE", doneCount)}

        {/* Date history */}
        {history.length > 1 && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            {history.slice(0, 5).map((d) => (
              <button key={d} onClick={() => switchDate(d)} style={{
                fontSize: 10, padding: "3px 10px", borderRadius: 16,
                fontFamily: mono, cursor: "pointer", transition: "all 0.15s",
                background: selectedDate === d ? "rgba(0,229,160,0.12)" : "transparent",
                border: `1px solid ${selectedDate === d ? "rgba(0,229,160,0.3)" : "rgba(0,229,160,0.08)"}`,
                color: selectedDate === d ? "#00E5A0" : "#4b7a5e",
              }}>{d.slice(5)}</button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      {error ? (
        <div style={{ color: "#4b7a5e", fontSize: 13, fontFamily: mono, padding: "2rem 0" }}>{error}</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: "#4b7a5e", fontSize: 13, fontFamily: mono, padding: "2rem 0" }}>
          Žádná videa v této kategorii.
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 12,
        }}>
          {filtered.map((v) => (
            <VideoCard
              key={v.url}
              video={v}
              tier={v.tier}
              done={done.has(v.url)}
              onToggleDone={() => toggleDone(v.url)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
