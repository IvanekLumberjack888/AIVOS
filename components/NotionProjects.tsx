"use client";

import { useEffect, useState } from "react";

interface NotionPage {
  id: string;
  title: string;
  lastEdited: string;
  url: string;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function NotionProjects() {
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/notion/projects")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setPages(data.pages);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-10 rounded-lg bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
        ⚠️ {error}
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <p className="text-sm text-white/30 text-center py-4">
        No projects found
      </p>
    );
  }

  return (
    <ul className="space-y-1.5">
      {pages.map((page, i) => (
        <li key={page.id}>
          <a
            href={page.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-mono text-emerald-500/60 w-5 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm text-white/80 group-hover:text-white transition-colors truncate">
                {page.title.replace(/—/g, "–")}
              </span>
            </div>
            <span className="text-xs text-white/30 shrink-0 ml-2">
              {relativeTime(page.lastEdited)}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
