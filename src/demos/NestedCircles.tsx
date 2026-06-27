import { useState } from 'react';
import { Demo } from './Demo';

// Definitions are the source glossary entries for IA / ML / DL (verbatim).
const CIRCLES = [
  { k: 'IA', r: 140, cy: 150, fill: '#F6E7C9', label: 'IA — Intelligence Artificielle', def: 'Domaine qui cherche à faire accomplir par des machines des tâches qui demandent normalement de l’intelligence humaine.' },
  { k: 'ML', r: 92, cy: 170, fill: '#EFCDA6', label: 'ML — Apprentissage Automatique', def: 'Sous-domaine de l’IA où la machine apprend des règles à partir d’exemples, au lieu qu’on les programme à la main.' },
  { k: 'DL', r: 48, cy: 195, fill: '#C8553D', label: 'DL — Apprentissage Profond', def: 'Branche du ML qui utilise des réseaux de neurones à plusieurs couches (« profonds »).' },
];

export function NestedCircles({ title, intro }: { title: string; intro: string }) {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <Demo title={title} intro={intro}>
      <div className="demo-row">
        <svg viewBox="0 0 300 300" width="260" height="260" className="demo-svg">
          {CIRCLES.map((c, i) => (
            <circle
              key={c.k}
              cx={150}
              cy={c.cy}
              r={c.r}
              fill={c.fill}
              stroke={sel === i ? '#2A1A12' : '#C8553D'}
              strokeWidth={sel === i ? 4 : 2}
              style={{ cursor: 'pointer' }}
              onClick={() => setSel(i)}
            />
          ))}
          <text x={150} y={42} textAnchor="middle" className="demo-svg-tag" fill="#8a5a20" style={{ pointerEvents: 'none' }}>IA</text>
          <text x={150} y={112} textAnchor="middle" className="demo-svg-tag" fill="#7a4416" style={{ pointerEvents: 'none' }}>ML</text>
          <text x={150} y={202} textAnchor="middle" className="demo-svg-tag" fill="#fff" style={{ pointerEvents: 'none' }}>DL</text>
        </svg>
        <div className="demo-info">
          {sel === null ? (
            <p><strong>Clique un cercle</strong> pour lire sa définition ici.</p>
          ) : (
            <>
              <strong>{CIRCLES[sel].label}</strong>
              <p>{CIRCLES[sel].def}</p>
              <p className="demo-muted">DL ⊂ ML ⊂ IA — chaque cercle est contenu dans le précédent.</p>
            </>
          )}
        </div>
      </div>
    </Demo>
  );
}
