import { useState } from 'react';
import { Demo } from './Demo';

// One multi-turn agentic task, verbatim from the source demo.
const LOOP = [
  { lbl: 'thought', name: 'Réflexion', txt: "Pour calculer le total, il me faut d'abord le prix unitaire de l'article. Je ne l'ai pas — je vais le chercher." },
  { lbl: 'action', name: 'Action', txt: 'chercher_prix({ "article": "support-écran" })' },
  { lbl: 'obs', name: 'Observation', txt: '{ "prix_unitaire": 25 }' },
  { lbl: 'thought', name: 'Réflexion', txt: "Bien : 25 $ l'unité. Maintenant 4 unités, puis +15 % de taxe. J'utilise la calculatrice." },
  { lbl: 'action', name: 'Action', txt: 'calculatrice({ "expression": "25 * 4 * 1.15" })' },
  { lbl: 'obs', name: 'Observation', txt: '{ "resultat": 115 }' },
  { lbl: 'final', name: 'Réponse finale', txt: 'Le total pour 4 unités, taxe de 15 % comprise, est de 115 $.' },
] as const;

export function AgentLoop({ title, intro }: { title: string; intro: string }) {
  const [shown, setShown] = useState(0); // number of steps revealed
  const done = shown >= LOOP.length;
  const turns = LOOP.slice(0, shown).filter((s) => s.lbl === 'action').length;

  return (
    <Demo title={title} intro={intro}>
      <div className="loop-trace">
        {LOOP.slice(0, shown).map((s, i) => {
          const isCode = s.lbl === 'action' || s.lbl === 'obs';
          return (
            <div className="loop-step" key={i}>
              <span className={`loop-lbl ${s.lbl}`}>{s.name}</span>
              {isCode ? <div className="codeline">{s.lbl === 'action' ? '→ ' : '← '}{s.txt}</div> : <div>{s.txt}</div>}
            </div>
          );
        })}
        {shown === 0 && <p className="demo-muted">Demande : « Quel est le total pour 4 supports-écran, taxe de 15 % comprise ? »</p>}
      </div>
      <div className="demo-actions">
        <button className="demo-btn" onClick={() => setShown((n) => Math.min(n + 1, LOOP.length))} disabled={done}>
          {done ? 'Tâche terminée ✓' : 'Étape suivante →'}
        </button>
        {shown > 0 && <button className="demo-btn ghost" onClick={() => setShown(0)}>Réinitialiser</button>}
        <span className="demo-muted">Tours d’outil : {turns}</span>
      </div>
    </Demo>
  );
}
