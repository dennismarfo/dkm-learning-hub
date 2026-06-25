import { useState } from 'react';
import { Demo } from './Demo';

// Predefined generation states, verbatim from the source demo.
const STATES: { ctx: string; opts: [string, number][] }[] = [
  { ctx: 'Le chat dort sur le ___', opts: [['tapis', 42], ['canapé', 28], ['lit', 18], ['toit', 12]] },
  { ctx: 'Le chat dort sur le tapis ___', opts: [['.', 55], ['du', 22], ['chaud', 14], ['et', 9]] },
  { ctx: 'Le chat dort sur le tapis. ___', opts: [['Il', 38], ['Le', 24], ['Soudain', 20], ['Dehors', 18]] },
];

export function NextWord({ title, intro }: { title: string; intro: string }) {
  const [idx, setIdx] = useState(0);
  const s = STATES[idx];
  const atEnd = idx === STATES.length - 1;
  return (
    <Demo title={title} intro={intro}>
      <div className="gen-text">{s.ctx}</div>
      <div className="prob-bars">
        {s.opts.map(([word, pct], oi) => (
          <button key={oi} className="prob-bar reset" onClick={() => setIdx((i) => Math.min(i + 1, STATES.length - 1))}>
            <span className="prob-word">{word}</span>
            <span className="prob-track"><span className="prob-fill" style={{ width: `${pct}%` }} /></span>
            <span className="prob-pct">{pct}%</span>
          </button>
        ))}
      </div>
      <div className="demo-actions">
        <span className="demo-muted">
          {atEnd ? 'Le modèle a généré mot après mot, chacun choisi parmi des probabilités.' : 'Choisis un mot : le modèle prédit le suivant, puis recommence.'}
        </span>
        {idx > 0 && <button className="demo-btn ghost" onClick={() => setIdx(0)}>Recommencer</button>}
      </div>
    </Demo>
  );
}
