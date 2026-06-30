import { useState } from 'react';
import { Demo } from './Demo';

// M1 — Hébergement : assemble les trois choses dont un agent a besoin pour
// passer de prototype à « employé » qui tourne tout seul.
const PARTS = [
  { key: 'bureau', label: '🏢 Un bureau', sub: 'le serveur (VPS ou serverless) où il tourne en continu' },
  { key: 'cles', label: '🔑 Des clés', sub: 'ses secrets et accès, dans des variables d’environnement' },
  { key: 'horaires', label: '⏰ Des horaires', sub: 'ses déclencheurs : un webhook, une heure, un nouveau message' },
];

export function HostingEmployee({ title, intro }: { title: string; intro: string }) {
  const [on, setOn] = useState<Record<string, boolean>>({});
  const toggle = (k: string) => setOn((s) => ({ ...s, [k]: !s[k] }));
  const count = PARTS.filter((p) => on[p.key]).length;
  const ready = count === PARTS.length;

  return (
    <Demo title={title} intro={intro}>
      <div className="opts">
        {PARTS.map((p) => (
          <button key={p.key} className={`opt reset ${on[p.key] ? 'correct' : ''}`} onClick={() => toggle(p.key)}>
            <strong>{p.label}</strong> — {p.sub}
          </button>
        ))}
      </div>
      <p className={`quiz-fb ${ready ? 'good' : 'bad'}`}>
        {ready
          ? '✓ Les trois sont là : ton agent a un bureau, des clés et des horaires. Il travaille tout seul — c’est un employé, plus un prototype.'
          : `${count}/3 — tant qu’il manque une pièce, l’agent attend qu’on le pousse. C’est encore un prototype.`}
      </p>
    </Demo>
  );
}
