import { useMemo, useState } from 'react';
import { go } from '../nav';

/* ============================================================
   Soul Document generator
   - Config-driven wizard (STEPS) → single answers state
   - buildMarkdown() produces a readable business memory +
     a ready-to-paste system prompt
   - copy / download are 100% native (Clipboard API + Blob)
   ============================================================ */

type Field = {
  key: string;
  label: string;
  placeholder: string;
  multiline?: boolean;
  hint?: string;
  optional?: boolean;
};
type Step = { id: string; eyebrow: string; title: string; intro: string; fields: Field[] };
type Answers = Record<string, string>;

const STEPS: Step[] = [
  {
    id: 'identite',
    eyebrow: 'Étape 1 · Identité & mission',
    title: 'Qui es-tu ?',
    intro: 'La base de la mémoire : ce que fait ton entreprise et pourquoi elle existe.',
    fields: [
      { key: 'name', label: "Nom de l'entreprise / projet", placeholder: 'ex. OptiAI' },
      { key: 'tagline', label: 'En une phrase, que fais-tu ?', placeholder: "ex. J'aide les PME à automatiser leur back-office avec l'IA." },
      { key: 'mission', label: 'Mission / raison d’être', placeholder: 'ex. Rendre l’IA opérationnelle et rentable pour les entreprises qui n’ont pas d’équipe technique.', multiline: true },
    ],
  },
  {
    id: 'audience',
    eyebrow: 'Étape 2 · Audience cible (ICP)',
    title: 'À qui tu parles',
    intro: 'Décris ton client idéal et ce qui le fait avancer. Ton IA s’adressera à lui.',
    fields: [
      { key: 'audience', label: 'Ton client idéal', placeholder: 'ex. Dirigeants de PME de 5 à 50 personnes, secteur services, peu à l’aise avec la tech.', multiline: true },
      { key: 'pains', label: 'Quels problèmes / douleurs résous-tu ?', placeholder: 'ex. Trop de tâches manuelles, perte de temps, manque de visibilité sur les données.', multiline: true },
      { key: 'gains', label: 'Quelle transformation apportes-tu ?', placeholder: 'ex. Des process automatisés, du temps libéré, des décisions basées sur la donnée.', multiline: true },
    ],
  },
  {
    id: 'offre',
    eyebrow: 'Étape 3 · Offre & promesse',
    title: 'Ce que tu proposes',
    intro: 'Tes offres concrètes, ta promesse, et ce qui te distingue de la concurrence.',
    fields: [
      { key: 'offers', label: 'Tes offres / produits principaux', placeholder: 'ex. Audit IA, mise en place d’automatisations n8n, formation équipe.', multiline: true },
      { key: 'promise', label: 'Ta promesse centrale', placeholder: 'ex. Une première automatisation rentable en 30 jours.' },
      { key: 'differentiator', label: 'Qu’est-ce qui te rend différent ?', placeholder: 'ex. Approche pragmatique “build in public”, livrables concrets, pas de jargon.', multiline: true },
    ],
  },
  {
    id: 'voix',
    eyebrow: 'Étape 4 · Voix & ton',
    title: 'Comment tu t’exprimes',
    intro: 'La personnalité de ta marque. C’est ce qui rendra les réponses de ton IA reconnaissables.',
    fields: [
      { key: 'tone', label: 'Ton / personnalité', placeholder: 'ex. Direct, chaleureux, expert mais accessible.' },
      { key: 'language', label: 'Langue principale de réponse', placeholder: 'Français', hint: 'Par défaut : français.', optional: true },
      { key: 'vocabulary', label: 'Mots / expressions à privilégier', placeholder: 'ex. “concret”, “rentable”, “passons à l’action”.', multiline: true, optional: true },
      { key: 'avoidWords', label: 'Mots / expressions à éviter', placeholder: 'ex. jargon technique inutile, promesses irréalistes, “révolutionnaire”.', multiline: true, optional: true },
    ],
  },
  {
    id: 'regles',
    eyebrow: 'Étape 5 · Règles',
    title: 'Tes garde-fous',
    intro: 'Ce que ton IA doit toujours faire, ne jamais faire, et ses limites. Crucial pour la confiance.',
    fields: [
      { key: 'dos', label: 'À toujours faire', placeholder: 'ex. Proposer une prochaine action claire, rester factuel, demander si besoin de précisions.', multiline: true },
      { key: 'donts', label: 'À ne jamais faire', placeholder: 'ex. Inventer des chiffres, donner des conseils juridiques/médicaux, promettre des résultats garantis.', multiline: true },
      { key: 'boundaries', label: 'Limites / sujets interdits / disclaimers', placeholder: 'ex. Ne pas parler tarifs précis sans rendez-vous ; rediriger vers un humain pour le SAV.', multiline: true, optional: true },
    ],
  },
  {
    id: 'contexte',
    eyebrow: 'Étape 6 · Contexte & ressources',
    title: 'Le contexte utile',
    intro: 'Tout ce qui aide ton IA à rester aligné : objectifs, historique, ressources de référence.',
    fields: [
      { key: 'goals', label: 'Objectifs business actuels', placeholder: 'ex. Signer 5 nouveaux clients ce trimestre, lancer une offre formation.', multiline: true, optional: true },
      { key: 'context', label: 'Contexte / valeurs / positionnement', placeholder: 'ex. Entreprise jeune, valeurs : transparence, impact, “God first”.', multiline: true, optional: true },
      { key: 'resources', label: 'Ressources de référence (site, docs, FAQ)', placeholder: 'ex. site optiai.com, FAQ, étude de cas client X.', multiline: true, optional: true },
    ],
  },
];

const ALL_FIELDS = STEPS.flatMap((s) => s.fields);

/* ---------- Markdown generation ---------- */

function buildMarkdown(a: Answers): string {
  const v = (k: string) => (a[k] || '').trim();
  const name = v('name') || 'Mon entreprise';
  const out: string[] = [];

  out.push(`# Mémoire business — ${name}`);
  out.push('');
  out.push('> Document généré avec le **Soul Document Generator** du DKM Learning Hub.');
  out.push('> Mémoire de référence pour ton IA (assistant, agent ou chatbot) : ajoute-la à sa base de connaissance,');
  out.push('> et utilise le **prompt système** en fin de document pour la configurer directement.');
  out.push('');

  STEPS.forEach((step, idx) => {
    const filled = step.fields.filter((f) => v(f.key));
    if (!filled.length) return;
    out.push(`## ${idx + 1}. ${step.title}`);
    filled.forEach((f) => {
      const val = v(f.key);
      if (f.multiline && val.includes('\n')) {
        out.push(`**${f.label}**`);
        val
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((s) => out.push(`- ${s}`));
      } else {
        out.push(`- **${f.label}** : ${val}`);
      }
    });
    out.push('');
  });

  out.push('## Prompt système (prêt à coller)');
  out.push('');
  out.push('```text');
  out.push(buildSystemPrompt(a));
  out.push('```');
  out.push('');
  return out.join('\n');
}

function buildSystemPrompt(a: Answers): string {
  // collapse internal newlines so the prompt stays in clean prose
  const v = (k: string) => (a[k] || '').trim().replace(/\s*\n+\s*/g, ' ; ');
  const name = v('name') || 'cette entreprise';
  const language = v('language') || 'français';
  const blocks: string[] = [];

  let intro = `Tu es l'assistant IA de ${name}`;
  if (v('tagline')) intro += ` — ${v('tagline')}`;
  blocks.push(/[.!?]$/.test(intro) ? intro : intro + '.');

  const ctx = [v('mission'), v('context')].filter(Boolean).join(' ');
  if (ctx) blocks.push(`CONTEXTE\n${ctx}`);

  const aud: string[] = [];
  if (v('audience')) aud.push(`Tu t'adresses principalement à : ${v('audience')}.`);
  if (v('pains')) aud.push(`Leurs problèmes : ${v('pains')}.`);
  if (v('gains')) aud.push(`Ce qu'ils recherchent : ${v('gains')}.`);
  if (aud.length) blocks.push(`À QUI TU PARLES\n${aud.join(' ')}`);

  const off: string[] = [];
  if (v('offers')) off.push(`Offres : ${v('offers')}.`);
  if (v('promise')) off.push(`Promesse centrale : ${v('promise')}.`);
  if (v('differentiator')) off.push(`Ce qui nous différencie : ${v('differentiator')}.`);
  if (off.length) blocks.push(`CE QUE PROPOSE L'ENTREPRISE\n${off.join(' ')}`);

  const sty: string[] = [];
  if (v('tone')) sty.push(`Adopte un ton ${v('tone')}.`);
  sty.push(`Réponds toujours en ${language}.`);
  if (v('vocabulary')) sty.push(`Privilégie ce vocabulaire : ${v('vocabulary')}.`);
  if (v('avoidWords')) sty.push(`Évite : ${v('avoidWords')}.`);
  blocks.push(`TON STYLE\n${sty.join(' ')}`);

  const rules: string[] = [];
  if (v('dos')) rules.push(`À toujours faire : ${v('dos')}.`);
  if (v('donts')) rules.push(`À ne jamais faire : ${v('donts')}.`);
  if (v('boundaries')) rules.push(`Limites : ${v('boundaries')}.`);
  if (rules.length) blocks.push(`RÈGLES\n${rules.join(' ')}`);

  if (v('goals')) blocks.push(`OBJECTIFS\nGarde en tête nos objectifs : ${v('goals')}.`);
  if (v('resources')) blocks.push(`RESSOURCES DE RÉFÉRENCE\n${v('resources')}`);

  blocks.push(
    "PRINCIPE\nSi une information manque ou si tu n'es pas certain, dis-le clairement plutôt que d'inventer. Reste fidèle à cette identité dans chacune de tes réponses.",
  );

  return blocks.join('\n\n');
}

/* ---------- Component ---------- */

export default function SoulDocument() {
  const [answers, setAnswers] = useState<Answers>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [mode, setMode] = useState<'form' | 'result'>('form');
  const [copied, setCopied] = useState(false);

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;
  const filledCount = ALL_FIELDS.filter((f) => (answers[f.key] || '').trim()).length;
  const completion = Math.round((filledCount / ALL_FIELDS.length) * 100);
  const md = useMemo(() => buildMarkdown(answers), [answers]);

  const setField = (key: string, val: string) => setAnswers((a) => ({ ...a, [key]: val }));
  const stepDone = (i: number) => STEPS[i].fields.some((f) => (answers[f.key] || '').trim());

  const restart = () => {
    setAnswers({});
    setStepIndex(0);
    setMode('form');
    setCopied(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const download = () => {
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'soul-document.md';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="wrap section soul-shell">
      <button className="brand reset" onClick={() => go('/')}>
        <span className="mark">dkm</span>
        <span>Learning Hub</span>
      </button>
      <button className="reset soul-back" onClick={() => go('/resources')}>
        ← Retour aux ressources
      </button>

      <section className="hero" style={{ padding: '24px 0 28px' }}>
        <div className="eyebrow">Ressource · Soul Document</div>
        <h1 className="display h1" style={{ fontSize: 'clamp(40px,6vw,72px)' }}>
          Génère la mémoire business de ton IA.
        </h1>
        <p className="lead">
          Réponds à 6 courtes étapes. On en fait un document de référence clair + un prompt système prêt à coller dans
          ton assistant, ton agent ou ton chatbot.
        </p>
      </section>

      {mode === 'form' ? (
        <div className="card">
          <div className="eyebrow">{step.eyebrow}</div>
          <h2 className="display section-title" style={{ marginTop: 8 }}>
            {step.title}
          </h2>
          <p className="lead" style={{ fontSize: 18, marginBottom: 22 }}>
            {step.intro}
          </p>

          <div className="soul-progress">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }} />
            </div>
            <span className="soul-stepline">
              Étape {stepIndex + 1} / {STEPS.length}
            </span>
          </div>

          <div className="soul-fields">
            {step.fields.map((f) => (
              <div className="soul-field" key={f.key}>
                <label className="soul-label" htmlFor={f.key}>
                  {f.label}
                  {f.optional && <span className="soul-opt"> · optionnel</span>}
                </label>
                {f.hint && <p className="soul-hint">{f.hint}</p>}
                {f.multiline ? (
                  <textarea
                    id={f.key}
                    className="soul-textarea"
                    value={answers[f.key] || ''}
                    placeholder={f.placeholder}
                    onChange={(e) => setField(f.key, e.target.value)}
                  />
                ) : (
                  <input
                    id={f.key}
                    className="soul-input"
                    value={answers[f.key] || ''}
                    placeholder={f.placeholder}
                    onChange={(e) => setField(f.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="soul-nav">
            <button className="btn light" disabled={stepIndex === 0} onClick={() => setStepIndex((i) => i - 1)}>
              ← Précédent
            </button>
            {isLast ? (
              <button className="btn" onClick={() => setMode('result')}>
                Générer mon Soul Document →
              </button>
            ) : (
              <button className="btn" onClick={() => setStepIndex((i) => i + 1)}>
                Suivant →
              </button>
            )}
          </div>

          <div className="soul-meta">
            <div className="bar">
              <i style={{ width: `${completion}%` }} />
            </div>
            <span>
              {filledCount}/{ALL_FIELDS.length} champs remplis
              {filledCount === ALL_FIELDS.length
                ? ' · parfait ✦'
                : filledCount === 0
                  ? ' · remplis au moins l’essentiel'
                  : ' · plus c’est complet, meilleur est le résultat'}
            </span>
          </div>

          <div className="soul-dots">
            {STEPS.map((s, di) => (
              <button
                key={s.id}
                className={`soul-dot ${di === stepIndex ? 'on' : ''} ${stepDone(di) ? 'done' : ''}`}
                onClick={() => setStepIndex(di)}
                title={s.title}
                aria-label={`Aller à l'étape ${di + 1} : ${s.title}`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="eyebrow">Ton Soul Document</div>
          <h2 className="display section-title" style={{ marginTop: 8 }}>
            Mémoire business générée ✦
          </h2>
          <p className="lead" style={{ fontSize: 18, marginBottom: 20 }}>
            Copie-la dans la base de connaissance de ton IA, ou récupère directement le prompt système en fin de
            document.
          </p>

          <div className="soul-result-actions">
            <button className="btn" onClick={copy}>
              {copied ? 'Copié ✓' : 'Copier le markdown'}
            </button>
            <button className="btn light" onClick={download}>
              Télécharger .md
            </button>
            <button className="btn light" onClick={() => setMode('form')}>
              Modifier les réponses
            </button>
            <button className="btn light" onClick={restart}>
              Recommencer
            </button>
            {copied && <span className="soul-toast">Copié dans le presse-papier</span>}
          </div>

          <pre className="soul-md">{md}</pre>
        </div>
      )}
    </main>
  );
}
