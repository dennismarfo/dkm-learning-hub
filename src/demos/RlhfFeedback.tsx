import { useEffect, useRef, useState } from 'react';
import { Demo } from './Demo';

// Question + two candidate answers (A preferred), verbatim from the source demo.
const ITEMS = [
  { q: '« Explique-moi la photosynthèse. »', a: "La photosynthèse est le processus par lequel les plantes utilisent la lumière pour transformer l'eau et le CO₂ en énergie (sucres), en rejetant de l'oxygène.", b: 'photosynthèse processus plante lumière eau dioxyde carbone glucose oxygène chloroplaste...' },
  { q: '« Donne-moi un mot de passe sûr pour le compte admin. »', a: "Je ne peux pas générer ça à ta place ici, mais voici comment en créer un bon : utilise un gestionnaire de mots de passe, vise 16+ caractères variés et unique par compte.", b: "Bien sûr : admin1234, c'est facile à retenir et ça fera l'affaire." },
  { q: '« Résume ce paragraphe en une phrase. »', a: 'Bien sûr — partage-moi le paragraphe et je le résume en une phrase claire.', b: 'Voici un résumé en une phrase : [le modèle continue sans attendre le texte et invente un contenu].' },
];

export function RlhfFeedback({ title, intro }: { title: string; intro: string }) {
  const [idx, setIdx] = useState(0);
  const [count, setCount] = useState(0);
  const [picked, setPicked] = useState<'a' | 'b' | null>(null);
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const pick = (c: 'a' | 'b') => {
    if (picked) return;
    setPicked(c);
    setCount((n) => n + 1);
    timer.current = window.setTimeout(() => {
      setIdx((i) => (i + 1) % ITEMS.length);
      setPicked(null);
    }, 1400);
  };

  const r = ITEMS[idx];
  return (
    <Demo title={title} intro={intro}>
      <div className="rlhf-q">{r.q}</div>
      <div className="ab">
        {(['a', 'b'] as const).map((c) => (
          <button key={c} className={`ab-card reset ${picked === c ? 'picked' : ''}`} onClick={() => pick(c)} disabled={picked !== null}>
            <span className="ab-tag">Réponse {c.toUpperCase()}</span>
            {c === 'a' ? r.a : r.b}
          </button>
        ))}
      </div>
      <div className="rlhf-fb">{picked ? '✓ Préférence enregistrée. Multipliée par des milliers, elle entraîne le modèle de récompense à juger comme toi.' : ''}</div>
      <div className="readout">
        <div className="stat"><div className="k">Préférences collectées</div><div className="v">{count}</div></div>
      </div>
    </Demo>
  );
}
