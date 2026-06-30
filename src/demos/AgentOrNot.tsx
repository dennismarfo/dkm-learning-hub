import { useState } from 'react';
import { Demo } from './Demo';

// M6 — Discernement : pour chaque cas, décide si un agent se justifie, si une
// règle simple suffit, ou s'il vaut mieux ne pas automatiser du tout.
const CASES = [
  { q: 'Renommer des fichiers selon une règle fixe', best: 'rule', why: 'Tâche déterministe et stable : un simple « si ceci, alors cela » est plus fiable, moins cher et plus prévisible qu’un LLM.' },
  { q: 'Trier des retours clients par thème, en continu', best: 'agent', why: 'Du langage naturel, varié, à interpréter en continu : c’est un bon cas pour un agent.' },
  { q: 'Piloter une plateforme via un navigateur, contre ses règles', best: 'no', why: 'Zone interdite : le risque de conformité dépasse le gain. Le bon move est de ne pas construire.' },
  { q: 'Envoyer des virements sans relecture humaine', best: 'no', why: 'Le risque dépasse le gain : un faux pas coûte trop cher. On n’automatise pas ça tout seul.' },
];

const CHOICES = [
  { key: 'agent', label: 'Construire un agent' },
  { key: 'rule', label: 'Une règle simple suffit' },
  { key: 'no', label: 'Ne pas automatiser' },
];

export function AgentOrNot({ title, intro }: { title: string; intro: string }) {
  const [sel, setSel] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const c = CASES[sel];
  const right = picked === c.best;
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
        {CHOICES.map((ch) => {
          const state = picked === null ? '' : ch.key === c.best ? 'correct' : ch.key === picked ? 'wrong' : '';
          return (
            <button key={ch.key} className={`opt reset ${state}`} disabled={picked !== null} onClick={() => setPicked(ch.key)}>{ch.label}</button>
          );
        })}
      </div>
      {picked !== null && <p className={`quiz-fb ${right ? 'good' : 'bad'}`}>{(right ? '✓ ' : '✗ ') + c.why}</p>}
    </Demo>
  );
}
