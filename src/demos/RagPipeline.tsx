import { useState } from 'react';
import { Demo, useStagedReveal } from './Demo';

// Illustrative team knowledge base + questions, verbatim from the source demo.
const KB = [
  { id: 'A', txt: 'Validation : une fiche passe par trois étapes — rédaction, relecture par un pair, puis approbation par un responsable avant publication.', kw: ['valide', 'validation', 'fiche', 'publication', 'approbation', 'relecture', 'étapes', 'avant'] },
  { id: 'B', txt: 'Accès : seuls les membres avec le rôle « éditeur » peuvent modifier une fiche ; les autres ont un accès en lecture seule.', kw: ['accès', 'rôle', 'éditeur', 'modifier', 'lecture', 'droits', 'membre'] },
  { id: 'C', txt: 'Recherche : la base offre une recherche plein texte sur tout le contenu et un historique des modifications par fiche.', kw: ['recherche', 'plein', 'texte', 'historique', 'modifications', 'contenu'] },
  { id: 'D', txt: "Onboarding : un nouvel arrivant reçoit un compte, est ajouté à l'espace équipe, et suit le guide de démarrage la première semaine.", kw: ['onboarding', 'arrivant', 'compte', 'équipe', 'guide', 'démarrage', 'nouveau'] },
  { id: 'E', txt: "Sécurité : les sauvegardes sont quotidiennes et l'authentification à deux facteurs est obligatoire pour tous les comptes.", kw: ['sécurité', 'sauvegarde', 'authentification', 'facteurs', 'obligatoire', 'compte'] },
];
const QS = [
  { q: 'Comment je valide une fiche avant publication ?', kw: ['valide', 'validation', 'fiche', 'publication', 'avant', 'étapes'], ans: "D'après la base : la fiche suit trois étapes — rédaction, puis relecture par un pair, puis approbation par un responsable avant la publication." },
  { q: 'Qui a le droit de modifier le contenu ?', kw: ['droit', 'modifier', 'accès', 'rôle', 'contenu', 'éditeur'], ans: "D'après la base : seuls les membres ayant le rôle « éditeur » peuvent modifier une fiche ; les autres sont en lecture seule." },
  { q: "Que dois-je faire en arrivant dans l'équipe ?", kw: ['arrivant', 'onboarding', 'équipe', 'nouveau', 'compte', 'démarrage'], ans: "D'après la base : tu reçois un compte, tu es ajouté à l'espace équipe, et tu suis le guide de démarrage pendant la première semaine." },
];

// Retrieval: score each doc by keyword overlap with the question, keep top 2.
function retrieve(qkw: string[]) {
  return KB.map((k) => ({ ...k, s: qkw.filter((w) => k.kw.includes(w)).length }))
    .sort((a, b) => b.s - a.s)
    .filter((k) => k.s > 0)
    .slice(0, 2);
}

export function RagPipeline({ title, intro }: { title: string; intro: string }) {
  const [sel, setSel] = useState(0);
  const { lit, reveal } = useStagedReveal(4, 450);

  const select = (i: number) => {
    setSel(i);
    reveal();
  };

  const r = QS[sel];
  const top = retrieve(r.kw);
  const context = `Contexte = ["${top.map((k) => k.id).join('", "')}"] + question utilisateur → envoyé au modèle`;
  const stages = [
    { h: '1 · Question', body: <span>{r.q}</span> },
    { h: '2 · Récupération (passages les plus proches)', body: top.map((k) => (<div className="chunk" key={k.id}><span className="chunk-score">score {k.s}</span>[{k.id}] {k.txt}</div>)) },
    { h: '3 · Augmentation (contexte envoyé au modèle)', body: <span className="rag-context">{context}</span> },
    { h: '4 · Génération (réponse ancrée)', body: <span>{r.ans}</span> },
  ];

  return (
    <Demo title={title} intro={intro}>
      <div className="rag-qs">
        {QS.map((qq, i) => (
          <button key={i} className={`demo-btn ${i === sel ? '' : 'ghost'} rag-q`} onClick={() => select(i)}>{qq.q}</button>
        ))}
      </div>
      <div className="pipe">
        {stages.map((s, i) => (
          <div key={i} className={`stage ${i < lit ? 'on' : ''}`}>
            <div className="st-h">{s.h}</div>
            <div className="st-body">{s.body}</div>
          </div>
        ))}
      </div>
    </Demo>
  );
}
