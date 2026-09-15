import { FREQS, FUNCTIONS, STATUS_LABEL, hoursPerMonth, score, summarize, tasksOf, type Audit, type TaskEntry } from './anatomie-data';

/* ============================================================
   Rapport « L'anatomie de ton entreprise »
   Markdown pensé pour être collé dans une IA (Claude, ChatGPT,
   Gemini…) : structure stable, chiffres explicites, prompt de
   démarrage en tête. Sert de graine au Soul Document.
   ============================================================ */

const fmtDate = (iso?: string) => {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
};

function line(t: TaskEntry): string {
  if (t.status === 'FAIS') {
    const f = FREQS.find((x) => x.id === t.freq);
    const bits = [
      f ? f.short : null,
      t.minutes ? `${t.minutes} min par fois` : null,
      `≈ ${hoursPerMonth(t)} h/mois`,
      t.pain ? `pénibilité ${t.pain}/5` : null,
      t.repeat ? `répétitivité ${t.repeat}/5` : null,
      `score ${score(t)}`,
    ].filter(Boolean);
    return `- **${t.label}** · ${bits.join(' · ')}${t.note ? ` · _${t.note}_` : ''}`;
  }
  return `- ${t.label}${t.note ? ` · _${t.note}_` : ''}`;
}

export function buildReport(a: Audit): string {
  const s = summarize(a);
  const name = a.business.trim() || 'Mon entreprise';
  const priority = a.priorityId ? a.tasks[a.priorityId] : undefined;
  const out: string[] = [];

  out.push(`# L'anatomie de mon entreprise · ${name}`);
  out.push('');
  out.push(`> Rapport généré le ${fmtDate()} avec l'outil **L'anatomie de ton entreprise** du DKM Learning Hub.`);
  out.push('> Ce document décrit ce que je fais réellement dans mon entreprise, fonction par fonction, avec le temps que ça me coûte.');
  out.push('> Il est conçu pour être collé tel quel dans une IA (Claude, ChatGPT, Gemini, autre) comme contexte de départ.');
  out.push('');

  out.push('## Comment utiliser ce rapport avec une IA');
  out.push('');
  out.push('Colle le rapport complet dans une nouvelle conversation, puis pose une de ces questions :');
  out.push('');
  out.push('```text');
  out.push("Voici la carte de mon entreprise (7 fonctions, tâches récurrentes, temps et pénibilité).");
  out.push("1. Résume en 5 lignes où part mon temps et ce qui me coûte le plus d'énergie.");
  out.push("2. Pour mon processus prioritaire, propose 3 façons concrètes de le rendre plus léger avec l'IA, de la plus simple à la plus automatisée, en précisant ce qui reste humain.");
  out.push("3. Parmi mes tâches « je devrais », dis-moi lesquelles une IA pourrait prendre en charge presque seule, et lesquelles demandent que je m'y mette moi-même.");
  out.push("Ne m'invente pas de chiffres : appuie-toi uniquement sur ce rapport et pose-moi des questions si quelque chose manque.");
  out.push('```');
  out.push('');

  out.push('## 1. Mon entreprise');
  out.push('');
  out.push(`- **Nom** : ${name}`);
  if (a.activity.trim()) out.push(`- **Ce que je fais** : ${a.activity.trim()}`);
  out.push(`- **Date de l'audit** : ${fmtDate()}`);
  out.push('');

  out.push('## 2. Vue d’ensemble');
  out.push('');
  out.push(`- **Temps total estimé sur les tâches récurrentes** : ≈ ${s.totalHours} h par mois`);
  out.push(`- **Tâches que je fais** : ${s.fais.length} · **que je devrais faire** : ${s.devrais.length} · **qui ne s'appliquent pas** : ${s.total - s.fais.length - s.devrais.length - (s.total - s.answered)}`);
  out.push('');
  out.push('| Fonction | Heures / mois | Tâches faites | Tâches « je devrais » |');
  out.push('| --- | ---: | ---: | ---: |');
  for (const x of s.hoursByFn) out.push(`| ${x.fn.n}. ${x.fn.name} | ${x.hours} | ${x.fais} | ${x.devrais} |`);
  out.push('');

  out.push('## 3. Mon processus prioritaire');
  out.push('');
  if (priority) {
    const fn = FUNCTIONS.find((f) => f.id === priority.fn);
    out.push(`**${priority.label}** (${fn ? fn.name : ''})`);
    out.push('');
    out.push(line(priority).replace(/^- /, ''));
    out.push('');
    out.push("C'est la tâche sur laquelle je veux travailler en premier : celle qui, une fois allégée ou automatisée, libère le plus de temps et d'énergie.");
  } else {
    out.push('_Pas encore choisi._');
  }
  out.push('');

  if (s.top.length) {
    out.push('## 4. Mes candidats (par score)');
    out.push('');
    out.push('Score = heures par mois × pénibilité × répétitivité. Plus le score est haut, plus la tâche vaut la peine d’être repensée.');
    out.push('');
    s.top.forEach((t, i) => out.push(`${i + 1}. ${line(t).replace(/^- /, '')}`));
    out.push('');
  }

  if (s.devrais.length) {
    out.push('## 5. Ce que je devrais faire et que je ne fais pas (ou pas assez)');
    out.push('');
    out.push("Souvent l'endroit où l'IA apporte le plus : elle permet de faire ce que je n'avais pas le temps de faire.");
    out.push('');
    for (const fn of FUNCTIONS) {
      const ts = s.devrais.filter((t) => t.fn === fn.id);
      if (!ts.length) continue;
      out.push(`**${fn.name}**`);
      ts.forEach((t) => out.push(line(t)));
      out.push('');
    }
  }

  out.push('## 6. La carte complète, fonction par fonction');
  out.push('');
  for (const fn of FUNCTIONS) {
    const ts = tasksOf(a, fn.id).filter((t) => !!t.status);
    out.push(`### ${fn.n}. ${fn.name} · ${fn.tagline}`);
    out.push('');
    if (!ts.length) {
      out.push('_Non renseigné._');
      out.push('');
      continue;
    }
    (['FAIS', 'DEVRAIS', 'NA'] as const).forEach((st) => {
      const sub = ts.filter((t) => t.status === st);
      if (!sub.length) return;
      out.push(`**${STATUS_LABEL[st]}**`);
      sub.forEach((t) => out.push(line(t)));
      out.push('');
    });
  }

  out.push('## 7. Prochaine étape');
  out.push('');
  out.push("Cette carte est la première pièce d'un système IA. La suivante est le **Soul Document** : la mémoire de mon entreprise (identité, clients, offre, ton, règles) que toute IA doit connaître avant de m'aider.");
  out.push('Générateur gratuit : https://dkm-learning-hub.vercel.app/resources/soul-document');
  out.push('');
  out.push('_DKM Learning Hub · apprendre, documenter, construire._');
  out.push('');
  return out.join('\n');
}

/** Résumé minimal envoyé au webhook (jamais le rapport complet). */
export function buildLeadSummary(a: Audit) {
  const s = summarize(a);
  const priority = a.priorityId ? a.tasks[a.priorityId] : undefined;
  return {
    business: a.business.trim() || null,
    activity: a.activity.trim() || null,
    totalHours: s.totalHours,
    faisCount: s.fais.length,
    devraisCount: s.devrais.length,
    top3: s.top.slice(0, 3).map((t) => ({ label: t.label, fn: t.fn, score: score(t) })),
    priority: priority ? { label: priority.label, fn: priority.fn, score: score(priority) } : null,
    hoursByFn: Object.fromEntries(s.hoursByFn.map((x) => [x.fn.id, x.hours])),
  };
}
