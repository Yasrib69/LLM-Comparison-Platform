'use client';
import { useEffect, useState } from 'react';
type RecordItem = { id: string; prompt: string; responseA: string; responseB: string; modelA: string; modelB: string; winner: 'A' | 'B' | null; createdAt: string };
type Scores = { total: number; a: number; b: number; aPercent: number; bPercent: number };
export default function Home() {
  const [visitorId, setVisitorId] = useState('');
  const [prompt, setPrompt] = useState('');
  const [current, setCurrent] = useState<RecordItem | null>(null);
  const [history, setHistory] = useState<RecordItem[]>([]);
  const [scores, setScores] = useState<Scores>({ total: 0, a: 0, b: 0, aPercent: 0, bPercent: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'compare' | 'leaderboard' | 'history'>('compare');
  useEffect(() => { let id = localStorage.getItem('llm-arena-id'); if (!id) { id = crypto.randomUUID(); localStorage.setItem('llm-arena-id', id); } setVisitorId(id); }, []);
  async function refresh(id = visitorId) {
    if (!id) return;
    try { const r = await fetch(`/api/data?visitorId=${encodeURIComponent(id)}`, { cache: 'no-store' }); const data = await r.json(); if (!r.ok) throw new Error(data.error); setHistory(data.history); setScores(data.leaderboard); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not load saved data.'); }
  }
  useEffect(() => { if (visitorId) refresh(visitorId); }, [visitorId]);
  async function compare(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true); setCurrent(null);
    try { const r = await fetch('/api/compare', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, visitorId }) }); const data = await r.json(); if (!r.ok) throw new Error(data.error); setCurrent(data); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Comparison failed.'); }
    finally { setLoading(false); }
  }
  async function vote(winner: 'A' | 'B') {
    if (!current || current.winner) return;
    setError('');
    try { const r = await fetch('/api/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: current.id, visitorId, winner }) }); const data = await r.json(); if (!r.ok) throw new Error(data.error); setCurrent({ ...current, winner }); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Vote failed.'); }
  }
  return <main className="container"><header><h1>LLM Comparison Platform</h1><p>Compare two real language models, vote, and track their performance.</p></header>
    <nav>{(['compare','leaderboard','history'] as const).map(x => <button key={x} className={tab === x ? 'active' : ''} onClick={() => { setTab(x); refresh(); }}>{x[0].toUpperCase()+x.slice(1)}</button>)}</nav>
    {error && <p role="alert" className="error">{error}</p>}
    {tab === 'compare' && <><form onSubmit={compare}><label htmlFor="prompt">Your prompt</label><textarea id="prompt" value={prompt} onChange={e=>setPrompt(e.target.value)} maxLength={3000} rows={4} placeholder="Ask anything..." required /><button className="primary" disabled={loading || !visitorId || !prompt.trim()}>{loading ? 'Generating both answers...' : 'Compare Models'}</button></form>
      {current && <section><h2>Responses</h2><div className="columns"><article><h3>Model A</h3><p className="response">{current.responseA}</p><button disabled={!!current.winner} onClick={()=>vote('A')}>Vote for A</button></article><article><h3>Model B</h3><p className="response">{current.responseB}</p><button disabled={!!current.winner} onClick={()=>vote('B')}>Vote for B</button></article></div>{current.winner && <p className="success">Vote saved for Model {current.winner}! Model A: {current.modelA}; Model B: {current.modelB}.</p>}</section>}</>}
    {tab === 'leaderboard' && <section><h2>Leaderboard</h2><p>Total recorded votes: {scores.total}</p><div className="columns"><article><h3>Model A</h3><p>Wins: {scores.a}</p><p>Vote share: {scores.aPercent}%</p></article><article><h3>Model B</h3><p>Wins: {scores.b}</p><p>Vote share: {scores.bPercent}%</p></article></div><p className="muted">A and B refer to the model positions shown during comparisons.</p></section>}
    {tab === 'history' && <section><h2>Your comparison history</h2>{history.length===0 ? <p>No comparisons yet.</p> : history.map(x=><article className="history" key={x.id}><small>{new Date(x.createdAt).toLocaleString()}</small><h3>{x.prompt}</h3><p><strong>Vote:</strong> {x.winner ? `Model ${x.winner}` : 'Not voted yet'}</p><details><summary>View both responses</summary><div className="columns"><div><h4>A — {x.modelA}</h4><p className="response">{x.responseA}</p></div><div><h4>B — {x.modelB}</h4><p className="response">{x.responseB}</p></div></div></details></article>)}</section>}
  
  </main>;
}
