import { useState } from 'react';
import { Demo, Slider } from './Demo';

const BUDGET = 8000;
const Q = 120; // question size, fixed (as in source)
const PARTS = [
  { k: 'sys', label: 'Système', color: '#9a8048' },
  { k: 'hist', label: 'Historique', color: '#2A1A12' },
  { k: 'doc', label: 'Documents', color: '#C8553D' },
  { k: 'q', label: 'Question', color: '#7a4416' },
  { k: 'ans', label: 'Réponse', color: '#e0a07a' },
] as const;

export function ContextWindow({ title, intro }: { title: string; intro: string }) {
  const [sys, setSys] = useState(600);
  const [hist, setHist] = useState(1500);
  const [doc, setDoc] = useState(2000);
  const [ans, setAns] = useState(1000);
  const values: Record<string, number> = { sys, hist, doc, q: Q, ans };
  const total = sys + hist + doc + ans + Q;
  const over = total > BUDGET;
  const scale = Math.max(total, BUDGET);

  return (
    <Demo title={title} intro={intro}>
      <Slider label="Instructions système" value={sys} min={0} max={2000} step={50} onChange={setSys} />
      <Slider label="Historique" value={hist} min={0} max={5000} step={100} onChange={setHist} />
      <Slider label="Documents (RAG)" value={doc} min={0} max={6000} step={100} onChange={setDoc} />
      <Slider label="Place pour la réponse" value={ans} min={200} max={3000} step={100} onChange={setAns} />
      <div className="ctx-bar">
        {PARTS.map((p) => {
          const v = values[p.k];
          const pct = (v / scale) * 100;
          return v > 0 ? (
            <div key={p.k} className="ctx-seg" style={{ width: `${pct}%`, background: p.color }}>
              {pct > 9 ? v : ''}
            </div>
          ) : null;
        })}
      </div>
      <div className="ctx-legend">
        {PARTS.map((p) => (
          <span key={p.k}><i style={{ background: p.color }} />{p.label}</span>
        ))}
      </div>
      <div className="readout">
        <div className="stat"><div className="k">Total utilisé</div><div className="v" style={{ color: over ? '#C8553D' : 'var(--ink)' }}>{total} t</div></div>
        <div className="stat"><div className="k">Budget (8 000)</div><div className="v">{BUDGET - total} t</div></div>
      </div>
      {over && <div className="ctx-over">⚠ Débordement ! Le modèle ne pourra pas tout lire — il faut élaguer.</div>}
    </Demo>
  );
}
