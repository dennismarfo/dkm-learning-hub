/* ============================================================
   L'anatomie de ton entreprise · données et moteur de score
   - 7 fonctions que toute entreprise a, même solo
   - tâches récurrentes typiques par fonction (le participant coche,
     il ne part pas d'une page blanche)
   - échelle de fréquence → occurrences mensuelles
   - score = heures/mois × pénibilité × répétitivité (tâches FAIS)
   Le gabarit source de vérité vit dans Notion (Cockpit › Offre
   Formation & Coaching DKM › Grille d'audit) ; ce fichier en est
   la transposition frontend.
   ============================================================ */

export type FunctionId = 'acq' | 'vente' | 'livr' | 'sc' | 'admin' | 'ops' | 'dir';

export type FunctionDef = {
  id: FunctionId;
  n: number;
  name: string;
  tagline: string;
  intro: string;
  tasks: string[];
};

export const FUNCTIONS: FunctionDef[] = [
  {
    id: 'acq',
    n: 1,
    name: 'Acquisition',
    tagline: 'Être vu par les bons clients',
    intro: 'Tout ce qui fait que des gens découvrent ton existence avant même de te parler.',
    tasks: [
      'Publier du contenu (réseaux, blogue, infolettre)',
      'Répondre aux commentaires et DM entrants',
      'Réseautage (événements, groupes, suivis après rencontre)',
      'Publicité (création, suivi, ajustement)',
      'Mettre à jour site web, fiche Google, profils',
      'Demander des avis et témoignages',
      'Partenariats et référencement croisé',
    ],
  },
  {
    id: 'vente',
    n: 2,
    name: 'Vente',
    tagline: 'Transformer un contact en client',
    intro: 'Du premier échange jusqu’à la signature. Souvent la fonction la plus négligée quand on est seul.',
    tasks: [
      'Prospection (identifier et contacter des clients potentiels)',
      'Répondre aux demandes entrantes (courriel, téléphone, formulaire)',
      'Appels ou rencontres de découverte',
      'Rédiger soumissions, devis, propositions',
      'Relancer les propositions sans réponse',
      'Tenir à jour le suivi des prospects (CRM, tableau, carnet)',
      'Négocier, conclure, faire signer',
    ],
  },
  {
    id: 'livr',
    n: 3,
    name: 'Livraison',
    tagline: 'Faire le travail vendu',
    intro: 'Ton métier, et tout ce qui l’entoure : préparation, livrables, allers-retours, coordination.',
    tasks: [
      'Le service ou la production elle-même (cœur de métier)',
      'Préparer un mandat, un rendez-vous, une intervention',
      'Rapports, comptes rendus, livrables écrits au client',
      'Révisions et allers-retours avec le client',
      'Coordination avec sous-traitants ou fournisseurs',
      'Planification et suivi de l’avancement des mandats',
    ],
  },
  {
    id: 'sc',
    n: 4,
    name: 'Service client',
    tagline: 'Garder et faire revenir',
    intro: 'Ce qui se passe après la vente : accueil, questions, suivi, fidélité.',
    tasks: [
      'Accueil et intégration d’un nouveau client (onboarding)',
      'Répondre aux questions courantes (souvent les mêmes)',
      'Confirmations, rappels de rendez-vous, suivis post-livraison',
      'Gérer plaintes, retards, imprévus',
      'Reprendre contact avec les anciens clients',
      'Programme de fidélité, offres aux clients existants',
    ],
  },
  {
    id: 'admin',
    n: 5,
    name: 'Administration et finance',
    tagline: 'Que l’argent rentre et que tout soit en règle',
    intro: 'Facturer, encaisser, classer, déclarer. Invisible quand ça marche, douloureux quand ça traîne.',
    tasks: [
      'Facturer',
      'Suivre les paiements et relancer les factures impayées',
      'Classer reçus et dépenses, tenue de livres',
      'Taxes (TPS/TVQ), acomptes, déclarations, comptable',
      'Contrats, ententes, assurances, conformité',
      'Suivi de trésorerie (ce qui rentre, ce qui sort, ce qui reste)',
      'Abonnements et fournisseurs (renouvellements, résiliations)',
    ],
  },
  {
    id: 'ops',
    n: 6,
    name: 'Opérations et outils',
    tagline: 'Faire tourner la machine',
    intro: 'L’organisation, les outils et la circulation de l’information entre eux.',
    tasks: [
      'Planifier la semaine, gérer l’agenda et les rendez-vous',
      'Trier et traiter la boîte courriel',
      'Saisir ou recopier des informations d’un outil à l’autre',
      'Classer documents et fichiers',
      'Écrire ou mettre à jour ses façons de faire (procédures)',
      'Choisir, configurer, payer ses outils',
    ],
  },
  {
    id: 'dir',
    n: 7,
    name: 'Direction',
    tagline: 'Décider où on va',
    intro: 'Le chapeau de dirigeant : objectifs, chiffres, décisions, apprentissage. Celui qu’on porte le moins souvent.',
    tasks: [
      'Fixer et revoir ses objectifs (mois, trimestre)',
      'Regarder ses chiffres (ventes, marges, temps)',
      'Décider des prix, des offres, des priorités',
      'Veille (marché, concurrents, outils)',
      'Se former, apprendre',
      'Prendre du recul (bilan hebdo, planification)',
    ],
  },
];

export type Status = 'FAIS' | 'DEVRAIS' | 'NA';

export const STATUS_LABEL: Record<Status, string> = {
  FAIS: 'Je le fais',
  DEVRAIS: 'Je devrais',
  NA: 'Pas chez moi',
};

export type FreqId = 'day+' | 'day' | 'week+' | 'week' | 'month' | 'year';

export const FREQS: { id: FreqId; label: string; short: string; perMonth: number }[] = [
  { id: 'day+', label: 'Plusieurs fois par jour', short: 'plusieurs fois / jour', perMonth: 60 },
  { id: 'day', label: 'Chaque jour', short: 'chaque jour', perMonth: 22 },
  { id: 'week+', label: 'Plusieurs fois par semaine', short: 'plusieurs fois / semaine', perMonth: 12 },
  { id: 'week', label: 'Chaque semaine', short: 'chaque semaine', perMonth: 4 },
  { id: 'month', label: 'Chaque mois', short: 'chaque mois', perMonth: 1 },
  { id: 'year', label: 'Quelques fois par an', short: 'quelques fois / an', perMonth: 0.25 },
];

export const MINUTE_PRESETS = [5, 15, 30, 60, 120];

export type TaskEntry = {
  id: string; // `${functionId}:${index}` or `${functionId}:c${n}` for custom
  fn: FunctionId;
  label: string;
  custom?: boolean;
  status?: Status;
  freq?: FreqId;
  minutes?: number;
  pain?: number; // 1..5
  repeat?: number; // 1..5
  note?: string;
};

export type Audit = {
  business: string;
  activity: string;
  tasks: Record<string, TaskEntry>;
  priorityId?: string;
  startedAt?: string;
};

export function emptyAudit(): Audit {
  const tasks: Record<string, TaskEntry> = {};
  for (const f of FUNCTIONS) {
    f.tasks.forEach((label, i) => {
      const id = `${f.id}:${i}`;
      tasks[id] = { id, fn: f.id, label };
    });
  }
  return { business: '', activity: '', tasks, startedAt: new Date().toISOString() };
}

export function hoursPerMonth(t: TaskEntry): number {
  if (t.status !== 'FAIS' || !t.freq || !t.minutes) return 0;
  const f = FREQS.find((x) => x.id === t.freq);
  if (!f) return 0;
  return Math.round(((t.minutes * f.perMonth) / 60) * 10) / 10;
}

export function isComplete(t: TaskEntry): boolean {
  if (t.status !== 'FAIS') return !!t.status;
  return !!t.freq && !!t.minutes && !!t.pain && !!t.repeat;
}

export function score(t: TaskEntry): number {
  if (t.status !== 'FAIS' || !t.pain || !t.repeat) return 0;
  return Math.round(hoursPerMonth(t) * t.pain * t.repeat);
}

export function tasksOf(a: Audit, fn: FunctionId): TaskEntry[] {
  return Object.values(a.tasks)
    .filter((t) => t.fn === fn)
    .sort((x, y) => (x.custom === y.custom ? x.id.localeCompare(y.id, 'fr', { numeric: true }) : x.custom ? 1 : -1));
}

export type Summary = {
  hoursByFn: { fn: FunctionDef; hours: number; fais: number; devrais: number }[];
  totalHours: number;
  top: TaskEntry[];
  devrais: TaskEntry[];
  fais: TaskEntry[];
  answered: number;
  total: number;
};

export function summarize(a: Audit): Summary {
  const all = Object.values(a.tasks);
  const fais = all.filter((t) => t.status === 'FAIS');
  const devrais = all.filter((t) => t.status === 'DEVRAIS');
  const hoursByFn = FUNCTIONS.map((fn) => {
    const ts = all.filter((t) => t.fn === fn.id);
    return {
      fn,
      hours: Math.round(ts.reduce((s, t) => s + hoursPerMonth(t), 0) * 10) / 10,
      fais: ts.filter((t) => t.status === 'FAIS').length,
      devrais: ts.filter((t) => t.status === 'DEVRAIS').length,
    };
  });
  const totalHours = Math.round(hoursByFn.reduce((s, x) => s + x.hours, 0) * 10) / 10;
  const top = [...fais].filter((t) => score(t) > 0).sort((x, y) => score(y) - score(x)).slice(0, 5);
  return {
    hoursByFn,
    totalHours,
    top,
    devrais,
    fais,
    answered: all.filter((t) => !!t.status).length,
    total: all.length,
  };
}

export const STORAGE_KEY = 'dkm.anatomie.v1';
