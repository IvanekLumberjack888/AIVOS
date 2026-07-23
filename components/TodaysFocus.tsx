"use client";

import { useEffect, useState } from "react";

interface Todo {
  id: string;
  text: string;
  checked: boolean;
}

interface FocusData {
  todos: Todo[];
  headings: string[];
  recentPages: Array<{ id: string; title: string; lastEdited: string; url: string }>;
  konicalUrl: string;
}

export function TodaysFocus() {
  const [data, setData] = useState<FocusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/notion/focus")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-8 rounded-lg bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
        ⚠️ Konica page offline: {error}
      </div>
    );
  }

  const hasTodos = data.todos.length > 0;

  return (
    <div className="space-y-3">
      {/* Context heading */}
      {data.headings[0] && (
        <p className="text-xs text-white/40 uppercase tracking-wider">
          {data.headings[0]}
        </p>
      )}

      {/* Todos / Next Actions */}
      {hasTodos ? (
        <ul className="space-y-2">
          {data.todos.map((todo) => (
            <li key={todo.id} className="flex items-start gap-2.5">
              <span
                className={`mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                  todo.checked
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-white/20"
                }`}
              >
                {todo.checked && "✓"}
              </span>
              <span
                className={`text-sm leading-snug ${
                  todo.checked ? "line-through text-white/30" : "text-white/70"
                }`}
              >
                {todo.text.replace(/—/g, "–")}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        // Fallback: show recent sub-pages when no todos found
        <ul className="space-y-1.5">
          {data.recentPages.map((page) => (
            <li key={page.id}>
              <a
                href={page.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/60 hover:text-emerald-400 transition-colors block"
              >
                → {page.title}
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* Link to Konica page */}
      <a
        href={data.konicalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-emerald-500/60 hover:text-emerald-400 transition-colors mt-1"
      >
        Open in Notion →
      </a>
    </div>
  );
}
