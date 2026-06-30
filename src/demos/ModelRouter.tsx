import { useState } from 'react';
import { Demo } from './Demo';

// M4 — Coût / modèle : associe chaque tâche au bon modèle. La règle : la taille
// du modèle suit la difficulté de la tâche (et on mesure avant d'optimiser).
const TASKS = [
  { q: 'Trier / étiqueter une note', best: 'small', why: 'Tâche simple et répétitive : un petit modèle rapide suffit, pour une fraction du coût.' },
  { q: 'Reformuler un texte court', best: 'small', why: 'Pas de raisonnement profond : le petit modèle fait le travail, plus vite et moins cher.' },
  { q: 'Rédiger un contenu délicat', best: 'large', why: 'La qualité et la nuance comptent : c’est un cas pour un grand modèle.' },
  { q: 'Arbitrer une décision business', best: 'large', why: 'Raisonnement à enjeu : on prend le grand modèle, le surcoût est justifié.' },
];

const CHOICES = [
  { key: 'small', label: 'Petit modèle (rapide, bon marché)' },
  { key: 'large', label: 'Grand modèle (puissant, coûteux)' },
];

export function ModelRouter({ title, intro }: { title: string; intro: string }) {
  const [sel, setSel] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const t = TASKS[sel];
  const right = picked === t.best;
  const select = (i: number) => {
    setSel(i);
    setPicked(null);
  };

  return (
    <Demo title={title} intro={intro}>
      <div className="rag-qs">
        {TASKS.map((tt, i) => (
          <button key={i} className={`demo-btn ${i === sel ? '' : 'ghost'} rag-q`} onClick={() => select(i)}>{tt.q}</button>
        ))}
      </div>
      <div className="opts">
        {CHOICES.map((c) => {
          const state = picked === null ? '' : c.key === t.best ? 'correct' : c.key === picked ? 'wrong' : '';
          return (
            <button key={c.key} className={`opt reset ${state}`} disabled={picked !== null} onClick={() => setPicked(c.key)}>{c.label}</button>
          );
        })}
      </div>
      {picked !== null && (
        <p className={`quiz-fb ${right ? 'good' : 'bad'}`}>
          {(right ? '✓ ' : '✗ ') + t.why}
          {!right && ' La règle : associer la taille du modèle à la difficulté de la tâche.'}
        </p>
      )}
    </Demo>
  );
}
