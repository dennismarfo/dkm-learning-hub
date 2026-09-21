/* ============================================================
   La pub en dix minutes · données du guide et du générateur
   - le guide : ce que couvrent les dix minutes, les étapes,
     les deux réglages, ce qui rate
   - le générateur : un brief de pub motion design, exécutable
     par Claude Code, avec un tableau de scènes chronométrées
   La thèse : la pub n'est pas générée, elle est dirigée. Ce
   fichier décrit donc un brief, jamais un prompt.
   ============================================================ */

export const STORAGE_KEY = 'dkm.pub-motion.v1';

/* ---------- le guide ---------- */

export type GuideStep = {
  n: number;
  title: string;
  body: string;
  detail?: string;
};

/**
 * Ce que les dix minutes couvrent, et ce qu'elles ne couvrent pas.
 * Chiffres vérifiés sur les fichiers de production : tout est daté du 11 septembre 2026,
 * voix off à 15h21, appel enregistré à 15h37, mixage à 16h14, rendu final à 22h53,
 * avec une longue coupure. Environ deux heures de travail réel.
 */
export const HONESTY = {
  covers: [
    'Décrire ta pub, sans rien inventer de technique.',
    'Obtenir l’animation, fabriquée à partir de ta description.',
    'Sortir une vidéo verticale, prête pour Meta.',
  ],
  excludes: [
    'Enregistrer ta voix et la caler au mot près.',
    'Filmer le vrai : ton écran, ton produit, ta main.',
    'Le son, la musique, le mixage.',
    'Vérifier que tout respecte bien tes couleurs et tes polices.',
  ],
  note:
    'Ma pub complète m’a pris une soirée. Voix off, appel enregistré, capture de mon téléphone et montage, tout dans la foulée, environ deux heures de travail réel. Les dix minutes dont je parle, c’est la partie animation : passer de ta description à la vidéo. C’est celle que les gens voient, et c’est sur elle qu’on me pose la question.',
};

/** Le bloc qui répond à « concrètement, je fais quoi ? ». En tête, avant tout le reste. */
export const WHAT_YOU_DO = {
  intro:
    'Trois choses, dans cet ordre. Tu peux commencer tout de suite : le formulaire est juste en bas de cette page.',
  steps: [
    {
      n: 1,
      title: 'Tu réponds à quatre écrans, ici',
      detail:
        'Ta marque, la durée, ce que ta pub raconte, tes couleurs. Aucune connaissance technique. Aucun chiffre à inventer : tu choisis une forme de pub et tout est déjà rempli.',
      time: 'environ 5 minutes',
    },
    {
      n: 2,
      title: 'Tu récupères ton brief et tu le colles dans Claude Code',
      detail:
        'Un simple fichier texte. Tu ouvres Claude Code dans un dossier vide, tu colles, tu envoies. La consigne de démarrage est déjà écrite en haut du fichier, tu n’as rien à ajouter.',
      time: 'environ 1 minute',
    },
    {
      n: 3,
      title: 'Tu valides, il fabrique, tu récupères la vidéo',
      detail:
        'Claude te propose un découpage en scènes, avec les secondes. Tu dis oui, ou tu corriges. Il construit la page, il la filme, et tu as ton fichier MP4.',
      time: 'environ 5 minutes',
    },
  ],
};

/** Le bloc qui rassure. La plupart des gens décrochent ici s'il n'est pas dit. */
export const NOT_NEEDED = {
  no: [
    'Tu n’écris pas une ligne de code. Pas une seule.',
    'Tu n’ouvres aucun logiciel de montage.',
    'Tu n’inventes aucun minutage. C’est Claude qui le propose.',
  ],
  yes:
    'Ton seul travail, c’est de dire ce que la pub doit raconter, et de vérifier ce qu’on te propose. C’est ça, diriger.',
  why:
    'C’est la seule compétence de ce guide, et c’est la seule qui ne périmera pas. Les outils changent tous les trois mois. Savoir cadrer un travail, non.',
};

export const PREREQS = [
  {
    label: 'Tes couleurs et tes polices',
    why: 'Deux ou trois couleurs, deux polices. Si tu n’en as pas, prends celles que tu utilises déjà ailleurs. On ne cherche pas une identité pendant l’exercice.',
  },
  {
    label: 'Claude Code',
    why: 'C’est lui qui fabrique la page. Toi, tu décides ce qu’il y a dessus. Si tu ne l’as jamais installé, compte une soirée, une seule fois.',
  },
  {
    label: 'Trois outils, une seule fois',
    why: 'Tu ne t’en sers jamais directement : ils travaillent pour Claude Code. Tu colles ces deux lignes dans ton terminal, et tu les oublies.',
    command: 'pip install playwright && playwright install chromium\nbrew install ffmpeg',
  },
];

export const GUIDE: GuideStep[] = [
  {
    n: 1,
    title: 'Tu décris. Tu n’inventes pas le minutage.',
    body:
      'Tu dis ce que la pub raconte, dans l’ordre : l’accroche, la preuve, l’appel. C’est Claude qui propose les secondes de chaque scène. Toi, tu vérifies qu’elles tiennent debout, et ça se voit sans être technique.',
    detail:
      'C’est exactement comme ça que j’ai procédé. Je n’ai jamais écrit un tableau de secondes à la main : je l’ai lu sur l’animation une fois qu’elle existait, pour y caler ma voix off.',
  },
  {
    n: 2,
    title: 'Ta pub est une page web',
    body:
      'Pas un fichier vidéo, pas un projet de montage. Une page, comme un site. La machine l’écrit à partir de ton brief. Tu l’ouvres dans ton navigateur, tu lui demandes n’importe quelle seconde, et elle te l’affiche.',
    detail:
      'Deux conséquences agréables. Tu vérifies ta pub tout de suite, sans attendre un rendu. Et comme c’est du texte, changer ta couleur d’accent la change dans toutes les scènes d’un coup. Sur une vidéo déjà exportée, tu recommencerais tout.',
  },
  {
    n: 3,
    title: 'Un petit programme filme la page',
    body:
      'Il ouvre ta page sans l’afficher, photographie chaque instant, et recolle les photos en vidéo. Trente photos par seconde. Tu tapes une ligne, tu attends, tu as ton fichier.',
    detail:
      'C’est lent, et c’est normal. Pour quinze secondes, compte une à deux minutes. Pour soixante, plutôt cinq. Pendant ce temps tu ne fais rien : c’est un bon moment pour écrire ta voix off.',
  },
];

export const SETTINGS_INTRO =
  'Tu n’as pas à retenir ces deux lignes : le générateur les écrit dans ton brief à ta place. Mais tu dois savoir à quoi elles servent, parce que c’est ce qui te permet de voir quand la machine s’est trompée.';

export const SETTINGS = [
  {
    demand: '« Attends que mes polices soient chargées. »',
    symptom: 'Sinon les premières secondes de ta vidéo sortent dans une autre police que la tienne.',
    why: 'L’ordinateur commence à photographier avant d’avoir fini de charger ta police. Tu ne le vois jamais en ouvrant la page toi-même, parce qu’à ce moment-là tout est déjà chargé. Tu le découvres dans la vidéo finale.',
    code: 'document.fonts.ready',
  },
  {
    demand: '« Sors la vidéo dans le format que tout le monde lit. »',
    symptom: 'Sinon ta vidéo marche sur ton ordinateur et refuse de se lire sur Meta et sur iPhone.',
    why: 'Il existe plusieurs façons de coder les couleurs d’une vidéo, et une seule passe partout. Tu l’apprends en envoyant la pub au client, ce qui est le plus mauvais moment. Piège en plus : le demander ne suffit pas toujours, il faut aussi convertir les couleurs avant. C’est déjà fait dans le gabarit.',
    code: '-pix_fmt yuv420p',
  },
];

/** Ce qu'il faut savoir REGARDER. Le lecteur valide une proposition, il ne la produit pas. */
export const FAILURES = [
  'L’accroche arrive trop tard. Sur un Reel, tu as trois secondes pour donner une raison de rester. Si la première chose intéressante est à la huitième seconde, personne ne la verra.',
  'L’appel à l’action passe en une seconde. Il lui en faut au moins trois, et il doit rester lisible jusqu’à la toute dernière image.',
  'La première image est noire. C’est pourtant elle qu’on voit dans le fil avant de cliquer : elle doit déjà dire quelque chose.',
  'La pub n’est pas identique d’un rendu à l’autre. Ça arrive quand l’animation dépend de l’heure réelle ou du hasard. Ton brief exige que la même seconde donne toujours la même image.',
  'Un fond vert pour incruster une capture d’écran. Ça ne marche presque jamais. Filme le vrai, ou fais-le dessiner.',
];

/** Vote anonyme : mesurer l'intérêt pour un tutoriel de direction artistique. */
export const VOTE = {
  topic: 'direction-artistique',
  eyebrow: 'Un vote, pas un formulaire',
  title: 'Un tuto pour créer ta direction artistique avec Claude ?',
  body:
    'Tes couleurs, tes polices, ton style, décidés avec Claude au lieu d’être copiés ailleurs. C’est ce qui manque à la plupart des gens avant même de penser à une pub. Si ça t’intéresse, dis-le : je saurai s’il faut le faire.',
  cta: 'Oui, ça m’intéresse',
  done: 'C’est noté. Merci.',
  note: 'Anonyme. Pas de courriel, pas de nom, rien d’autre que le compte.',
};

/* ---------- le générateur ---------- */

export type PlatformId = 'reels' | 'feed45' | 'feed11';

export type PlatformDef = {
  id: PlatformId;
  label: string;
  where: string;
  width: number;
  height: number;
};

export const PLATFORMS: PlatformDef[] = [
  { id: 'reels', label: 'Vertical', where: 'Reels, Stories, TikTok, Shorts', width: 1080, height: 1920 },
  { id: 'feed45', label: 'Portrait', where: 'Fil Instagram et Facebook', width: 1080, height: 1350 },
  { id: 'feed11', label: 'Carré', where: 'Fil, catalogue, bannières', width: 1080, height: 1080 },
];

export const DURATIONS = [15, 20, 30, 60];

/** Jamais montré à l'utilisateur : 30 convient à tout, et le choisir n'apporte rien. */
export const FPS = 30;

/* ---------- les modèles de pub ---------- */

export type TemplateId = 'ppa' | 'avant-apres' | 'demo' | 'libre';

export type Beat = {
  label: string;
  hint: string;
  placeholder: string;
  /** Part de la durée totale. La somme des parts d'un modèle vaut 1. */
  share: number;
};

export type TemplateDef = {
  id: TemplateId;
  label: string;
  tagline: string;
  beats: Beat[];
};

/**
 * Les modèles existent pour que personne ne parte d'une page blanche ni n'invente
 * un minutage. Les parts sont pensées pour que l'appel à l'action garde toujours
 * au moins trois secondes, même sur une pub de quinze.
 */
export const TEMPLATES: TemplateDef[] = [
  {
    id: 'ppa',
    label: 'Problème → Preuve → Appel',
    tagline: 'La forme la plus courante, et la plus sûre.',
    beats: [
      {
        label: 'L’accroche',
        hint: 'Le problème de ton client, montré plutôt que raconté. C’est ce qui décide si on reste.',
        placeholder: 'ex. Il est 21 h, un client remplit le formulaire, et personne ne le rappelle.',
        share: 0.2,
      },
      {
        label: 'La preuve',
        hint: 'Ce que ton produit fait, concrètement. Une chose qu’on peut voir, pas un adjectif.',
        placeholder: 'ex. Son téléphone sonne en moins d’une minute, et le rendez-vous se réserve tout seul.',
        share: 0.55,
      },
      {
        label: 'L’appel',
        hint: 'Une seule action. Elle reste à l’écran jusqu’à la dernière image.',
        placeholder: 'ex. Laisse ton numéro, on te rappelle en moins de soixante secondes.',
        share: 0.25,
      },
    ],
  },
  {
    id: 'avant-apres',
    label: 'Avant / Après',
    tagline: 'Quand le contraste est plus parlant que l’explication.',
    beats: [
      {
        label: 'Avant',
        hint: 'La situation d’aujourd’hui, celle qui coûte cher. Sois précis, pas dramatique.',
        placeholder: 'ex. Trois heures par semaine à rappeler des gens qui ne répondent plus.',
        share: 0.3,
      },
      {
        label: 'Après',
        hint: 'La même situation, une fois le problème réglé. Montre la différence, ne la commente pas.',
        placeholder: 'ex. Les rappels partent seuls, et tu ne vois que les rendez-vous confirmés.',
        share: 0.45,
      },
      {
        label: 'L’appel',
        hint: 'Une seule action. Elle reste à l’écran jusqu’à la dernière image.',
        placeholder: 'ex. Écris-moi le mot ESSAI et je te montre.',
        share: 0.25,
      },
    ],
  },
  {
    id: 'demo',
    label: 'Démonstration',
    tagline: 'Quand il faut voir le produit fonctionner pour y croire.',
    beats: [
      {
        label: 'La promesse',
        hint: 'Ce que la personne saura faire à la fin, en une phrase.',
        placeholder: 'ex. Une soumission envoyée en deux minutes, depuis ton téléphone.',
        share: 0.15,
      },
      {
        label: 'Comment ça marche',
        hint: 'Les gestes, dans l’ordre. Deux ou trois, pas dix.',
        placeholder: 'ex. Tu choisis le service, tu ajoutes une photo, tu envoies.',
        share: 0.3,
      },
      {
        label: 'Le résultat',
        hint: 'Ce qu’on obtient, à l’écran. C’est la preuve.',
        placeholder: 'ex. Le client reçoit le devis signé dans sa boîte, avec le prix.',
        share: 0.3,
      },
      {
        label: 'L’appel',
        hint: 'Une seule action. Elle reste à l’écran jusqu’à la dernière image.',
        placeholder: 'ex. Essaie-le gratuitement, le lien est en bio.',
        share: 0.25,
      },
    ],
  },
  {
    id: 'libre',
    label: 'Je pars de zéro',
    tagline: 'Tu nommes tes propres étapes.',
    beats: [
      { label: 'Étape 1', hint: 'Nomme-la et dis ce qu’on voit.', placeholder: 'Ce qu’on voit en premier.', share: 0.3 },
      { label: 'Étape 2', hint: 'Nomme-la et dis ce qu’on voit.', placeholder: 'Ce qui vient ensuite.', share: 0.45 },
      { label: 'Étape 3', hint: 'Nomme-la et dis ce qu’on voit.', placeholder: 'Ce qu’on voit en dernier.', share: 0.25 },
    ],
  },
];

export function templateOf(d: Draft): TemplateDef {
  return TEMPLATES.find((t) => t.id === d.template) ?? TEMPLATES[0];
}

/* ---------- le brouillon ---------- */

export type Scene = {
  id: string;
  label: string;
  start: number;
  end: number;
  shows: string;
};

export type Draft = {
  brand: string;
  product: string;
  audience: string;
  promise: string;
  action: string;
  platform: PlatformId;
  seconds: number;
  template: TemplateId;
  scenes: Scene[];
  accent: string;
  bg: string;
  ink: string;
  fontTitle: string;
  fontBody: string;
  forbidden: string;
  rules: string;
  startedAt: string;
};

let seq = 0;
export function newScene(label = '', start = 0, end = 0, shows = ''): Scene {
  seq += 1;
  return { id: `s${Date.now().toString(36)}${seq}`, label, start, end, shows };
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Construit les scènes d'un modèle pour une durée donnée.
 * Le texte déjà saisi est conservé, position par position : changer de durée ou de
 * modèle ne doit jamais effacer ce que la personne a écrit.
 */
export function buildScenes(id: TemplateId, seconds: number, previous: Scene[] = []): Scene[] {
  const tpl = TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
  let cursor = 0;
  return tpl.beats.map((b, i) => {
    const last = i === tpl.beats.length - 1;
    const start = round1(cursor);
    const end = last ? seconds : round1(Math.min(seconds, cursor + seconds * b.share));
    cursor = end;
    const prev = previous[i];
    return {
      id: prev ? prev.id : newScene().id,
      // en mode libre, on garde le nom que la personne a donné
      label: id === 'libre' && prev && prev.label.trim() ? prev.label : b.label,
      start,
      end,
      shows: prev ? prev.shows : '',
    };
  });
}

export function emptyDraft(): Draft {
  const seconds = 15;
  const template: TemplateId = 'ppa';
  return {
    brand: '',
    product: '',
    audience: '',
    promise: '',
    action: '',
    platform: 'reels',
    seconds,
    template,
    scenes: buildScenes(template, seconds),
    accent: '#C8553D',
    bg: '#2A1A12',
    ink: '#F4E59A',
    fontTitle: '',
    fontBody: '',
    forbidden: '',
    rules: '',
    startedAt: new Date().toISOString(),
  };
}

export function platformOf(d: Draft): PlatformDef {
  return PLATFORMS.find((p) => p.id === d.platform) ?? PLATFORMS[0];
}

/** Durée réelle, lue sur les scènes. Elle vaut `seconds` tant qu'on n'a rien ajusté à la main. */
export function duration(d: Draft): number {
  return d.scenes.reduce((max, s) => Math.max(max, s.end), 0);
}

export function frameCount(d: Draft): number {
  return Math.round(duration(d) * FPS);
}

export type Issue = { level: 'error' | 'warn'; text: string };

/**
 * Vérification du minutage. Elle ne sert plus qu'au panneau « ajuster » : avec un modèle,
 * le minutage est cohérent par construction. Rien ici ne bloque la génération du brief.
 */
export function checkTiming(d: Draft): Issue[] {
  const out: Issue[] = [];
  const ordered = [...d.scenes].sort((a, b) => a.start - b.start);

  ordered.forEach((s) => {
    if (s.end <= s.start) {
      out.push({ level: 'error', text: `« ${s.label || 'Scène sans nom'} » finit avant de commencer.` });
    } else if (s.end - s.start < 1) {
      out.push({ level: 'warn', text: `« ${s.label || 'Scène sans nom'} » dure moins d’une seconde. Personne n’aura le temps de la lire.` });
    }
  });

  for (let i = 1; i < ordered.length; i += 1) {
    const prev = ordered[i - 1];
    const cur = ordered[i];
    if (cur.start < prev.end) {
      out.push({ level: 'error', text: `« ${cur.label || 'Scène'} » commence avant la fin de « ${prev.label || 'la précédente'} ».` });
    } else if (cur.start > prev.end) {
      out.push({
        level: 'warn',
        text: `Trou de ${round1(cur.start - prev.end)} s entre « ${prev.label || 'la précédente'} » et « ${cur.label || 'Scène'} ». L’écran sera vide.`,
      });
    }
  }

  const last = ordered[ordered.length - 1];
  if (last && last.end - last.start < 3) {
    out.push({ level: 'warn', text: `« ${last.label || 'La dernière scène'} » porte l’appel à l’action et dure moins de trois secondes. C’est court pour être lu.` });
  }
  return out;
}

/**
 * Assez rempli pour que le brief vaille la peine.
 * Volontairement permissif : on n'empêche personne d'avancer.
 */
export function isUsable(d: Draft): boolean {
  return d.brand.trim().length > 0 && d.scenes.some((s) => s.shows.trim().length > 0);
}

/** Ce qu'il manque, dit en une phrase utile plutôt qu'en interdiction. */
export function missing(d: Draft): string | null {
  if (!d.brand.trim()) return 'Il manque le nom de ta marque, au premier écran.';
  if (!d.scenes.some((s) => s.shows.trim())) return 'Remplis au moins une étape de ta pub, pour que le brief ait quelque chose à raconter.';
  return null;
}
