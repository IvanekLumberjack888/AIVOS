"use client";

import { useEffect, useState } from "react";

interface ParaItem {
  id: string;
  title: string;
  lastEdited: string;
  url: string;
}

interface ParaSection {
  key: string;
  label: string;
  emoji: string;
  count: number;
  recent: ParaItem[];
}

export function NotionParaView() {
  const [sections, setSections] = useState<ParaSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/notion/para")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setSections(data.para);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {["🎯", "🗺️", "📚", "🗃️"].map((e) => (
          <div
            key={e}
            className="h-28 rounded-xl bg-white/5 animate-pulse flex items-center justify-center text-2xl opacity-30"
          >
            {e}
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
        ⚠️ Notion offline: {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {sections.map((section) => (
        <div
          key={section.key}
          className="rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/8 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white/80">
              {section.emoji} {section.label}
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
              {section.count}
            </span>
          </div>
          <ul className="space-y-1">
            {section.recent.map((page) => (
              <li key={page.id}>
                <a
                  href={page.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white/50 hover:text-white/80 transition-colors line-clamp-1 block"
                  title={page.title.replace(/—/g, "–")}
                >
                  {page.title.replace(/—/g, "–")}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
