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
 * En tête de page, non négociable.
 * Chiffres vérifiés sur les fichiers de production : tout est daté du 11 septembre 2026,
 * voix off à 15h21, appel enregistré à 15h37, mixage à 16h14, rendu final à 22h53,
 * avec une longue coupure entre les deux. Environ deux heures de travail réel.
 */
export const HONESTY = {
  covers: [
    'Décrire ta pub scène par scène, avec les secondes.',
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

/** Le bloc qui rassure. La plupart des gens décrochent ici s'il n'est pas dit. */
export const NOT_NEEDED = {
  no: [
    'Tu n’écris pas une ligne de code. Pas une seule.',
    'Tu n’ouvres aucun logiciel de montage.',
    'Tu ne choisis ni effets, ni transitions, ni calques.',
  ],
  yes:
    'Tu écris un brief. C’est-à-dire : tu décides ce qu’on voit, à quelle seconde, et dans quelles couleurs. Ensuite tu le donnes à Claude Code, et c’est lui qui fabrique.',
  why:
    'C’est la seule compétence de ce guide, et c’est la seule qui ne périmera pas. Les outils changent tous les trois mois. Savoir cadrer un travail, non.',
};

export const PREREQS = [
  {
    label: 'Tes couleurs et tes polices',
    why: 'Deux ou trois couleurs, deux polices. Décidées avant, pas pendant. Si tu les cherches en cours de route, tu ne seras pas à dix minutes.',
  },
  {
    label: 'Claude Code',
    why: 'C’est lui qui fabrique la page. Toi, tu décides ce qu’il y a dessus. Si tu ne l’as jamais installé, compte une soirée, une seule fois.',
  },
  {
    label: 'Trois outils, une seule fois',
    why: 'Tu ne t’en sers jamais directement : ils travaillent pour Claude Code. Tu les installes, et tu les oublies.',
    command: 'pip install playwright && playwright install chromium\nbrew install ffmpeg',
  },
];

export const GUIDE: GuideStep[] = [
  {
    n: 1,
    title: 'Écris ce qu’on voit, seconde par seconde',
    body:
      'Une ligne par scène : son nom, la seconde où elle commence, la seconde où elle finit, et ce qu’on voit. C’est tout le brief. Une pub de quinze secondes tient en trois ou quatre lignes.',
    detail:
      'Décide les secondes avant de décider les images. C’est le chronométrage qui commande. Si ton appel à l’action ne dure qu’une seconde, il ne sert à rien, aussi beau soit-il.',
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

/**
 * Les deux réglages. Le lecteur n'a pas à les taper : le générateur les écrit dans son
 * brief. Il doit savoir pourquoi ils y sont, parce que c'est ce qui lui permet de dire
 * à la machine qu'elle s'est trompée.
 */
export const SETTINGS_INTRO =
  'Tu n’as pas à retenir ces deux lignes : le générateur les met dans ton brief à ta place. Mais tu dois savoir à quoi elles servent, parce que c’est ce qui te permet de voir quand la machine s’est trompée.';

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

export const FAILURES = [
  'Deux scènes se chevauchent, ou il reste un trou entre elles. Le générateur te le signale avant que tu envoies quoi que ce soit.',
  'La pub n’est pas identique à chaque rendu. Ça arrive quand l’animation dépend de l’heure réelle ou du hasard. Ton brief doit exiger que la seconde 8 donne toujours exactement la même image.',
  'La première image est noire. C’est pourtant elle qu’on voit dans le fil avant de cliquer : elle doit déjà dire quelque chose.',
  'Un fond vert pour incruster une capture d’écran. Ça ne marche presque jamais. Filme le vrai, ou fais-le dessiner.',
  'La pub est belle, mais l’appel à l’action passe en une seconde. Donne-lui au moins trois secondes, et jusqu’à la dernière image.',
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
  { id: 'reels', label: 'Vertical 9:16', where: 'Reels, Stories, TikTok, Shorts', width: 1080, height: 1920 },
  { id: 'feed45', label: 'Portrait 4:5', where: 'Fil Instagram et Facebook', width: 1080, height: 1350 },
  { id: 'feed11', label: 'Carré 1:1', where: 'Fil, catalogue, bannières', width: 1080, height: 1080 },
];

export const FPS_CHOICES = [24, 25, 30, 60];

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
  fps: number;
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

/** On ne part jamais d'une page blanche : trois scènes types, à réécrire. */
export function emptyDraft(): Draft {
  return {
    brand: '',
    product: '',
    audience: '',
    promise: '',
    action: '',
    platform: 'reels',
    fps: 30,
    scenes: [
      newScene('Accroche', 0, 3, 'Le problème du client, montré, pas raconté.'),
      newScene('Preuve', 3, 11, 'Ce que le produit fait, à l’écran, en vrai.'),
      newScene('Appel', 11, 15, 'Une seule action, lisible jusqu’à la dernière image.'),
    ],
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

/** Durée totale = fin de la dernière scène. */
export function duration(d: Draft): number {
  return d.scenes.reduce((max, s) => Math.max(max, s.end), 0);
}

export function frameCount(d: Draft): number {
  return Math.round(duration(d) * d.fps);
}

export type Issue = { level: 'error' | 'warn'; text: string };

/**
 * Le moteur de vérification du chronométrage. C'est lui qui évite le raté le plus
 * fréquent : des scènes qui se chevauchent ou qui laissent un trou.
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
    if (!s.label.trim()) out.push({ level: 'warn', text: 'Une scène n’a pas de nom.' });
    if (!s.shows.trim()) out.push({ level: 'warn', text: `« ${s.label || 'Scène sans nom'} » ne dit pas ce qu’on voit.` });
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

  if (ordered.length && ordered[0].start > 0) {
    out.push({ level: 'warn', text: `La première scène commence à ${round1(ordered[0].start)} s. Les premières images seront vides.` });
  }
  return out;
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Assez rempli pour que le brief vaille la peine d'être généré. */
export function isUsable(d: Draft): boolean {
  return (
    d.brand.trim().length > 0 &&
    d.scenes.length > 0 &&
    d.scenes.every((s) => s.label.trim() && s.end > s.start) &&
    checkTiming(d).every((i) => i.level !== 'error')
  );
}
