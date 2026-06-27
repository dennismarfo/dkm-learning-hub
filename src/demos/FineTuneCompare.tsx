import { useState } from 'react';
import { Demo } from './Demo';

const ANSWERS = {
  base: "Cela dépend de votre organisation. En général, une bonne pratique consiste à faire relire votre contenu par quelqu'un, puis à le publier une fois qu'il est approuvé. Vérifiez les règles internes de votre équipe.",
  tuned: "Tu passes par notre flux en trois étapes : 1) tu rédiges la fiche ; 2) un pair la relit ; 3) un responsable l'approuve. Ce n'est qu'après l'étape 3 que le bouton « Publier » devient actif.",
};

export function FineTuneCompare({ title, intro }: { title: string; intro: string }) {
  const [mode, setMode] = useState<'base' | 'tuned'>('base');
  return (
    <Demo title={title} intro={intro}>
      <div className="seg">
        <button className={mode === 'base' ? 'on' : ''} onClick={() => setMode('base')}>Modèle de base</button>
        <button className={mode === 'tuned' ? 'on' : ''} onClick={() => setMode('tuned')}>Modèle spécialisé</button>
      </div>
      <div className="ft-question"><b>Question :</b> « Comment je valide une fiche avant publication ? »</div>
      <div className="ft-answer" style={{ borderLeftColor: mode === 'tuned' ? '#C8553D' : '#9a8048' }}>
        {ANSWERS[mode]}
      </div>
    </Demo>
  );
}
