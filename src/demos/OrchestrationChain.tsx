import { useState } from 'react';
import { Demo } from './Demo';

// M2 — Orchestration : remets les maillons dans l'ordre. Le modèle n'est qu'une
// étape ; tout le reste (déclencher, lire, retenir, router) est l'orchestration.
const STEPS = [
  { key: 'trigger', label: 'Déclencheur', sub: 'un webhook, une heure, un nouveau message' },
  { key: 'data', label: 'Données', sub: 'lire le bon contexte (note, base, fichier)' },
  { key: 'model', label: 'Modèle (LLM)', sub: 'la seule étape du LLM : décider / structurer' },
  { key: 'state', label: 'État', sub: 'écrire le résultat dans une base durable (Supabase)' },
  { key: 'dest', label: 'Destination', sub: 'envoyer vers Notion, Telegram, un email…' },
];

// Ordre d'affichage volontairement mélangé (déterministe — pas de Math.random).
const SHUFFLED = [STEPS[2], STEPS[4], STEPS[0], STEPS[3], STEPS[1]];

export function OrchestrationChain({ title, intro }: { title: string; intro: string }) {
  const [placed, setPlaced] = useState<string[]>([]);
  const [wrong, setWrong] = useState(false);
  const done = placed.length === STEPS.length;
  const nextStep = STEPS[placed.length];

  const click = (k: string) => {
    if (placed.includes(k)) return;
    if (nextStep && k === nextStep.key) {
      setPlaced((p) => [...p, k]);
      setWrong(false);
    } else {
      setWrong(true);
    }
  };

  return (
    <Demo title={title} intro={intro}>
      <div className="rag-qs">
        {SHUFFLED.map((s) => (
          <button
            key={s.key}
            className={`demo-btn ${placed.includes(s.key) ? '' : 'ghost'}`}
            disabled={placed.includes(s.key)}
            onClick={() => click(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="pipe">
        {placed.map((k, i) => {
          const s = STEPS.find((x) => x.key === k)!;
          return (
            <div key={k} className="stage on">
              <div className="st-h">{i + 1} · {s.label}</div>
              <div className="st-body">{s.sub}</div>
            </div>
          );
        })}
      </div>
      {wrong && !done && nextStep && (
        <p className="quiz-fb bad">Pas encore : le prochain maillon est « {nextStep.label} » — {nextStep.sub}.</p>
      )}
      {done && (
        <p className="quiz-fb good">
          ✓ Chaîne complète. Le modèle n’a fait qu’une étape ; tout le reste — déclencher, lire, retenir, router — c’est l’orchestration.
        </p>
      )}
    </Demo>
  );
}
