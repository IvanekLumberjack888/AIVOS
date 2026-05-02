'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

type Role = 'user' | 'assistant'
type Msg = { role: Role; content: string; ts?: number }
type Session = { id: string; title: string; createdAt: number; messages: Msg[] }

const KEY = 'aivos_chat_v1'
const load = (): Session[] => { try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] } }
const save = (s: Session[]) => localStorage.setItem(KEY, JSON.stringify(s))
const blank = (): Session => ({ id: crypto.randomUUID(), title: 'Nova konverzace', createdAt: Date.now(), messages: [] })
const ttl = (c: string) => c.length > 45 ? c.slice(0, 45) + '...' : c

export default function SessionsPage() {
  const [sess, setSess] = useState<Session[]>([])
  const [aid, setAid] = useState<string | null>(null)
  const [inp, setInp] = useState('')
  const [busy, setBusy] = useState(false)
  const [model, setModel] = useState('qwen2.5:7b')
  const endRef = useRef<HTMLDivElement>(null)
  const inpRef = useRef<HTMLTextAreaElement>(null)
  const abort = useRef<AbortController | null>(null)

  useEffect(() => { const s = load(); setSess(s); if (s.length) setAid(s[0].id) }, [])
  const active = sess.find(s => s.id === aid) ?? null
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [active?.messages.length])

  const upd = useCallback((id: string, fn: (s: Session) => Session) => {
    setSess(p => { const n = p.map(s => s.id === id ? fn(s) : s); save(n); return n })
  }, [])

  const create = useCallback(() => {
    const s = blank()
    setSess(p => { const n = [s, ...p]; save(n); return n })
    setAid(s.id)
    setTimeout(() => inpRef.current?.focus(), 50)
  }, [])

  const del = useCallback((id: string) => {
    setSess(p => { const n = p.filter(s => s.id !== id); save(n); if (aid === id) setAid(n[0]?.id ?? null); return n })
  }, [aid])

  const send = useCallback(async () => {
    if (!inp.trim() || busy) return
    let sid = aid
    if (!sid) { const s = blank(); setSess(p => { const n = [s, ...p]; save(n); return n }); setAid(s.id); sid = s.id }
    const um: Msg = { role: 'user', content: inp.trim(), ts: Date.now() }
    setInp(''); setBusy(true)
    upd(sid, s => ({ ...s, title: s.messages.length === 0 ? ttl(um.content) : s.title, messages: [...s.messages, um] }))
    upd(sid, s => ({ ...s, messages: [...s.messages, { role: 'assistant', content: '', ts: Date.now() }] }))
    try {
      abort.current = new AbortController()
      const hist = [...(sess.find(s => s.id === sid)?.messages ?? []), um]
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: hist, model, sessionId: sid }), signal: abort.current.signal })
      if (!res.ok) { const e = await res.json().catch(() => ({})); upd(sid, s => ({ ...s, messages: s.messages.slice(0, -1).concat({ role: 'assistant', content: 'Chyba: ' + (e.error ?? res.status) }) })); return }
      const rdr = res.body!.getReader(); const dec = new TextDecoder(); let buf = ''
      while (true) {
        const { done, value } = await rdr.read(); if (done) break
        buf += dec.decode(value, { stream: true })
        const parts = buf.split('\n\n'); buf = parts.pop() ?? ''
        for (const p of parts) {
          if (!p.startsWith('data: ')) continue; const d = p.slice(6); if (d === '[DONE]') continue
          try { const j = JSON.parse(d); if (j.content) upd(sid, s => { const m = [...s.messages]; const l = m[m.length - 1]; if (l?.role === 'assistant') m[m.length - 1] = { ...l, content: l.content + j.content }; return { ...s, messages: m } }) } catch { }
        }
      }
    } catch (e: unknown) { if ((e as Error).name !== 'AbortError') upd(sid, s => ({ ...s, messages: s.messages.slice(0, -1).concat({ role: 'assistant', content: 'Spojeni preruseno' }) })) }
    finally { setBusy(false) }
  }, [inp, busy, aid, sess, model, upd])

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'monospace', overflow: 'hidden' }}>
      <aside style={{ width: '256px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--accent)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em' }}>AIVOS CHAT</span>
          <button onClick={create} style={{ color: 'var(--accent)', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }} title="Nova konverzace">+</button>
        </div>
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
          <select value={model} onChange={e => setModel(e.target.value)} style={{ width: '100%', background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '11px', padding: '4px 6px', borderRadius: '4px' }}>
            <option>qwen2.5:7b</option><option>qwen2.5:14b</option><option>llama3.2:3b</option><option>mistral:7b</option><option>deepseek-r1:7b</option>
          </select>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {!sess.length && <p style={{ color: 'var(--dim)', fontSize: '11px', padding: '16px', textAlign: 'center' }}>Zadne konverzace</p>}
          {sess.map(s => (
            <div key={s.id} onClick={() => setAid(s.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)', background: s.id === aid ? 'var(--panel)' : 'transparent', borderLeft: s.id === aid ? '2px solid var(--accent)' : '2px solid transparent' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '11px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: s.id === aid ? 'var(--bright)' : 'var(--text)' }}>{s.title}</p>
                <p style={{ fontSize: '10px', margin: 0, color: 'var(--dim)' }}>{new Date(s.createdAt).toLocaleString('cs-CZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <button onClick={e => { e.stopPropagation(); del(s.id) }} style={{ background: 'none', border: 'none', color: 'var(--dim)', fontSize: '11px', cursor: 'pointer' }}>x</button>
            </div>
          ))}
        </div>
      </aside>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--panel)', flexShrink: 0 }}>
          <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '13px' }}>{active?.title ?? 'AIVOS Chat'}</span>
          <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--dim)' }}>{model} local</span>
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!active && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', color: 'var(--dim)' }}>
              <div style={{ fontSize: '48px' }}>⚡</div>
              <p style={{ fontSize: '13px', margin: 0 }}>Zacni novou konverzaci</p>
              <button onClick={create} style={{ padding: '8px 20px', background: 'var(--accent)', color: '#000', fontSize: '13px', fontWeight: 700, border: 'none', borderRadius: '6px', cursor: 'pointer' }}>+ Nova konverzace</button>
            </div>
          )}
          {active?.messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {m.role === 'assistant' && <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>A</div>}
              <div style={{ maxWidth: '75%', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', whiteSpace: 'pre-wrap', lineHeight: 1.6, background: m.role === 'user' ? 'var(--accent)' : 'var(--panel)', color: m.role === 'user' ? '#000' : 'var(--bright)', border: m.role === 'assistant' ? '1px solid var(--border)' : 'none' }}>
                {m.content || (busy && i === active.messages.length - 1 ? '...' : '')}
              </div>
              {m.role === 'user' && <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: 'var(--dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>I</div>}
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--panel)', padding: '12px', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <textarea ref={inpRef} value={inp} onChange={e => setInp(e.target.value)} onKeyDown={onKey} placeholder="Napiste zpravu... (Enter odeslat, Shift+Enter novy radek)" rows={1} disabled={busy}
              style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--bright)', fontSize: '13px', borderRadius: '6px', padding: '8px 12px', resize: 'none', minHeight: '38px', maxHeight: '120px', fontFamily: 'monospace' }} />
            {busy
              ? <button onClick={() => { abort.current?.abort(); setBusy(false) }} style={{ padding: '8px 12px', background: '#ef4444', color: '#fff', fontSize: '13px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Stop</button>
              : <button onClick={send} disabled={!inp.trim()} style={{ padding: '8px 12px', background: 'var(--accent)', color: '#000', fontSize: '13px', fontWeight: 700, border: 'none', borderRadius: '6px', cursor: 'pointer', opacity: inp.trim() ? 1 : 0.4 }}>Send</button>
            }
          </div>
          <p style={{ fontSize: '10px', color: 'var(--dim)', margin: '4px 0 0' }}>Enter odeslat · Shift+Enter novy radek · odpovedi streamuji</p>
        </div>
      </div>
    </div>
  )
}
