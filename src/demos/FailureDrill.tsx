import { useState } from 'react';
import { Demo } from './Demo';

// M3 — Fiabilité : un scénario d'échec tombe, choisis la parade la plus fiable.
// La fiabilité, ce n'est pas l'absence d'erreur — c'est la bonne réaction à l'erreur.
const CASES = [
  {
    q: 'L’outil ne répond pas',
    opts: ['Planter et arrêter la tâche', 'Réessayer un nombre limité de fois, puis dégrader proprement', 'Inventer une réponse plausible'],
    correct: 1,
    ok: '✓ Un échec passager (réseau, surcharge) se retente — mais un nombre borné de fois, puis on dégrade proprement.',
    no: 'Ni planter, ni inventer : on réessaie un nombre limité de fois, puis on dégrade proprement.',
  },
  {
    q: 'Le contexte devient trop long',
    opts: ['Tout réinjecter quand même', 'Résumer l’historique et ne charger que le pertinent', 'Couper la conversation au hasard'],
    correct: 1,
    ok: '✓ On maîtrise le contexte : résumer l’historique long et ne charger que les documents pertinents.',
    no: 'Tout réinjecter fait déborder la fenêtre. On résume et on ne garde que le pertinent.',
  },
  {
    q: 'La sortie est mal formée',
    opts: ['La renvoyer telle quelle', 'Valider puis réparer (re-demander un format strict)', 'Supprimer la tâche'],
    correct: 1,
    ok: '✓ On valide la sortie et on répare plutôt que de propager une donnée cassée.',
    no: 'On ne propage pas une sortie cassée : on valide et on répare (format strict, nouvelle tentative).',
  },
];

export function FailureDrill({ title, intro }: { title: string; intro: string }) {
  const [sel, setSel] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const c = CASES[sel];
  const select = (i: number) => {
    setSel(i);
    setPicked(null);
  };

  return (
    <Demo title={title} intro={intro}>
      <div className="rag-qs">
        {CASES.map((cc, i) => (
          <button key={i} className={`demo-btn ${i === sel ? '' : 'ghost'} rag-q`} onClick={() => select(i)}>{cc.q}</button>
        ))}
      </div>
      <div className="opts">
        {c.opts.map((o, i) => {
          const state = picked === null ? '' : i === c.correct ? 'correct' : i === picked ? 'wrong' : '';
          return (
            <button key={i} className={`opt reset ${state}`} disabled={picked !== null} onClick={() => setPicked(i)}>{o}</button>
          );
        })}
      </div>
      {picked !== null && <p className={`quiz-fb ${picked === c.correct ? 'good' : 'bad'}`}>{picked === c.correct ? c.ok : c.no}</p>}
    </Demo>
  );
}
