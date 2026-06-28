import { useEffect, useRef, useState } from 'react';
import { Demo } from './Demo';

// Questions + the agent's reasoning trace, verbatim from the source demo.
const TU = [
  { q: 'Quel temps fait-il à Montréal ?', thought: "Je n'ai pas la météo en temps réel. Je dois appeler l'outil météo.", action: 'meteo({ "ville": "Montréal" })', obs: '{ "temp": 4, "ciel": "nuageux", "vent": "15 km/h" }', final: 'À Montréal, il fait actuellement 4 °C, ciel nuageux, vent de 15 km/h.' },
  { q: 'Combien font 1847 × 23 ?', thought: "Je ne dois pas calculer ça de tête : ce serait peu fiable. J'appelle la calculatrice.", action: 'calculatrice({ "expression": "1847 * 23" })', obs: '{ "resultat": 42481 }', final: '1847 × 23 = 42 481.' },
  { q: 'Quelle est la dernière version de Node.js ?', thought: 'Ma connaissance peut être périmée. Je vérifie sur le web.', action: 'recherche_web({ "requete": "dernière version Node.js" })', obs: '{ "extrait": "La version actuelle est Node.js 24.x." }', final: "D'après ma recherche, la version actuelle de Node.js est la 24.x." },
];

export function ToolUse({ title, intro }: { title: string; intro: string }) {
  const [sel, setSel] = useState(0);
  const [lit, setLit] = useState(4);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const select = (i: number) => {
    setSel(i);
    setLit(0);
    timers.current.forEach(clearTimeout);
    timers.current = [0, 1, 2, 3].map((n) => window.setTimeout(() => setLit(n + 1), n * 500));
  };

  const t = TU[sel];
  const stages = [
    { h: 'Réflexion', body: <span>{t.thought}</span>, code: false },
    { h: 'Action (appel d’outil)', body: <span>→ {t.action}</span>, code: true },
    { h: 'Observation (résultat de l’outil)', body: <span>← {t.obs}</span>, code: true },
    { h: 'Réponse finale', body: <span>{t.final}</span>, code: false },
  ];

  return (
    <Demo title={title} intro={intro}>
      <div className="rag-qs">
        {TU.map((tu, i) => (
          <button key={i} className={`demo-btn ${i === sel ? '' : 'ghost'} rag-q`} onClick={() => select(i)}>{tu.q}</button>
        ))}
      </div>
      <div className="pipe">
        {stages.map((s, i) => (
          <div key={i} className={`stage ${i < lit ? 'on' : ''}`}>
            <div className="st-h">{s.h}</div>
            <div className={`st-body ${s.code ? 'rag-context' : ''}`}>{s.body}</div>
          </div>
        ))}
      </div>
    </Demo>
  );
}
