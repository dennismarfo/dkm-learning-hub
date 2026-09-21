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

/** Ce que les dix minutes couvrent, et ce qu'elles ne couvrent pas. En tête de page, non négociable. */
export const HONESTY = {
  covers: [
    'Écrire le brief de l’animation, scène par scène.',
    'Obtenir une page web qui dessine la pub à n’importe quelle seconde.',
    'La filmer et sortir un MP4 vertical prêt pour Meta.',
  ],
  excludes: [
    'La voix off, écrite au mot près et posée sur la seconde.',
    'Le tournage réel : un vrai écran, un vrai produit, une vraie main.',
    'Le son, la musique, le mixage.',
    'La direction artistique vérifiée contre une charte.',
  ],
  note:
    'Ma pub complète a pris deux jours, pas dix minutes. Les dix minutes, c’est le décor : du brief à l’animation rendue. C’est la partie que les gens voient et sur laquelle on me pose la question.',
};

export const PREREQS = [
  { label: 'Une charte déjà décidée', why: 'Deux ou trois couleurs et deux polices. Si tu les cherches pendant l’exercice, tu ne seras pas à dix minutes.' },
  { label: 'Claude Code installé', why: 'C’est lui qui écrit la page. Toi, tu écris le brief.' },
  { label: 'Python, Playwright et ffmpeg', why: 'Les trois outils que le programme de rendu utilise. Une seule installation, une fois pour toutes.' },
];

export const GUIDE: GuideStep[] = [
  {
    n: 1,
    title: 'Écris le tableau des scènes',
    body:
      'Toute la structure d’une pub tient sur une ligne par scène : son libellé, sa seconde de début, sa seconde de fin, et ce qu’on voit. Rien d’autre. C’est ça, le brief.',
    detail:
      'Une pub de soixante secondes en tient dix. Une pub de quinze en tient trois ou quatre. Décide les secondes avant de décider les images : c’est le chronométrage qui commande, pas l’inverse.',
  },
  {
    n: 2,
    title: 'L’animation est une page web',
    body:
      'Pas un logiciel de montage. Un fichier index.html, avec une fonction render(t) qui dessine l’instant qu’on lui demande. Tu tapes render(8), elle affiche la seconde huit.',
    detail:
      'Deux avantages immédiats. Tu vas n’importe où dans la pub instantanément, sans scroller une timeline. Et comme c’est du texte, changer une couleur d’accent la change dans toutes les scènes d’un coup. Sur une vidéo déjà exportée, tu recommences.',
  },
  {
    n: 3,
    title: 'Un programme de seize lignes la filme',
    body:
      'render.py ouvre un navigateur sans fenêtre, règle la taille à 1080 par 1920, puis boucle : il appelle render(t), prend une capture, l’envoie à ffmpeg qui empile tout en vidéo.',
    detail:
      'Trente images par seconde. Pour soixante secondes, ça fait mille huit cents captures. C’est lent, compte quelques minutes. Pendant ce temps tu ne fais rien, c’est un bon moment pour écrire ta voix off.',
  },
];

/** Les deux réglages. Réels, tirés de render.py, avec leur symptôme. */
export const SETTINGS = [
  {
    code: "await page.evaluate('document.fonts.ready')",
    title: 'Attendre les polices avant la première capture',
    symptom: 'Sans cette ligne, les vingt premières images sortent en Times New Roman.',
    why: 'Le navigateur commence à dessiner avant d’avoir fini de télécharger tes polices. Personne ne le voit venir, parce qu’à l’écran, en ouvrant la page à la main, tout est déjà chargé.',
  },
  {
    code: 'ffmpeg -pix_fmt yuv420p',
    title: 'Forcer le format de couleur à la sortie',
    symptom: 'Sans ce réglage, ta vidéo se lit sur ton ordinateur et nulle part ailleurs.',
    why: 'Meta, iPhone et la plupart des lecteurs refusent les autres formats de couleur. Tu l’apprends en envoyant la pub au client, ce qui est le plus mauvais moment. Piège supplémentaire : si tes images arrivent en JPEG, ffmpeg garde la plage de couleur pleine et sort du yuvj420p en ignorant ton réglage. Il faut convertir la plage en même temps. C’est fait dans le gabarit.',
  },
];

export const FAILURES = [
  'Les scènes se chevauchent ou laissent un trou. Le générateur te le signale avant que tu envoies le brief.',
  'L’animation dépend de l’heure réelle ou d’un hasard non semé : deux rendus donnent deux vidéos différentes. render(t) doit être déterministe.',
  'Une incrustation sur fond vert. Ça ne marche presque jamais. Filme le vrai, ou dessine-le.',
  'La pub est belle mais l’appel à l’action passe en une seconde. Donne-lui au moins trois secondes à l’écran.',
];

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
