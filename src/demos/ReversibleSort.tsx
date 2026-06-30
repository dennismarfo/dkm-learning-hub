import { useState } from 'react';
import { Demo } from './Demo';

// M5 — Garde-fous : classe chaque action. Les irréversibles passent par une
// validation humaine — c'est le premier jeu de garde-fous d'un agent.
const ACTIONS = [
  { label: 'Lire une base de données', irreversible: false },
  { label: 'Résumer un document', irreversible: false },
  { label: 'Préparer un brouillon interne', irreversible: false },
  { label: 'Envoyer un email à un client', irreversible: true },
  { label: 'Supprimer des fichiers', irreversible: true },
  { label: 'Publier un post public', irreversible: true },
];

export function ReversibleSort({ title, intro }: { title: string; intro: string }) {
  // choice[i] === true → classé « irréversible » ; false → « réversible ».
  const [choice, setChoice] = useState<Record<number, boolean>>({});
  const [checked, setChecked] = useState(false);
  const set = (i: number, v: boolean) => {
    setChoice((c) => ({ ...c, [i]: v }));
    setChecked(false);
  };
  const allSet = ACTIONS.every((_, i) => choice[i] !== undefined);
  const correctCount = ACTIONS.filter((a, i) => choice[i] === a.irreversible).length;

  return (
    <Demo title={title} intro={intro}>
      <div className="pipe">
        {ACTIONS.map((a, i) => {
          const mark = checked && choice[i] !== undefined ? (choice[i] === a.irreversible ? '✓ ' : '✗ ') : '';
          return (
            <div key={i} className="stage on demo-row">
              <span className="st-body demo-col">{mark}{a.label}</span>
              <span className="demo-actions">
                <button className={`demo-btn ${choice[i] === false ? '' : 'ghost'}`} onClick={() => set(i, false)}>Réversible</button>
                <button className={`demo-btn ${choice[i] === true ? '' : 'ghost'}`} onClick={() => set(i, true)}>Irréversible → validation</button>
              </span>
            </div>
          );
        })}
      </div>
      <div className="demo-actions">
        <button className="demo-btn" disabled={!allSet} onClick={() => setChecked(true)}>Vérifier</button>
      </div>
      {checked && (
        <p className={`quiz-fb ${correctCount === ACTIONS.length ? 'good' : 'bad'}`}>
          {correctCount}/{ACTIONS.length} bien classées.{' '}
          {correctCount === ACTIONS.length
            ? 'Tout ce qui est irréversible — envoyer, supprimer, publier, payer — passe par une validation humaine.'
            : 'Rappel : envoyer, supprimer, publier, payer sont irréversibles → validation humaine obligatoire.'}
        </p>
      )}
    </Demo>
  );
}
