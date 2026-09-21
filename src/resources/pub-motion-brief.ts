import {
  checkTiming,
  duration,
  frameCount,
  platformOf,
  round1,
  type Draft,
} from './pub-motion-data';

/* ============================================================
   Brief de pub motion design, en Markdown.
   Pensé pour être collé tel quel dans Claude Code, à la racine
   d'un dossier vide. Structure stable, secondes explicites,
   consigne de démarrage en tête.
   La règle qui compte : signaler un échec plutôt que l'inventer.
   ============================================================ */

const fmtDate = () => new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });

export function slugify(s: string, fallback: string): string {
  const out = s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return out || fallback;
}

export function buildBrief(d: Draft): string {
  const p = platformOf(d);
  const total = duration(d);
  const frames = frameCount(d);
  const brand = d.brand.trim() || 'Ma marque';
  const scenes = [...d.scenes].sort((a, b) => a.start - b.start);
  const issues = checkTiming(d);
  const out: string[] = [];

  out.push(`# Brief · pub motion design · ${brand}`);
  out.push('');
  out.push(`> Brief écrit le ${fmtDate()} avec **La pub en dix minutes**, ressource gratuite du DKM Learning Hub.`);
  out.push('> À coller tel quel dans Claude Code, ouvert à la racine d’un dossier vide.');
  out.push('> Ce document décrit une pub. Il ne demande pas de la générer, il demande de l’exécuter.');
  out.push('');

  out.push('## Consigne de démarrage');
  out.push('');
  out.push('```text');
  out.push('Voici le brief de ma pub. Construis les deux fichiers décrits dans « Ce que je veux en sortie ».');
  out.push('Respecte le tableau des scènes à la seconde près.');
  out.push('Ne change aucune couleur, aucune police et aucune durée sans me le demander.');
  out.push("Si une partie ne marche pas, dis-le-moi et explique pourquoi. Ne l'invente pas, ne la contourne pas en silence.");
  out.push('Quand c’est fini, rends-moi un court rapport : ce qui a marché, ce qui a raté, ce que tu as dû décider seul.');
  out.push('```');
  out.push('');

  out.push('## 1. La pub');
  out.push('');
  out.push(`- **Marque** : ${brand}`);
  if (d.product.trim()) out.push(`- **Produit ou service** : ${d.product.trim()}`);
  if (d.audience.trim()) out.push(`- **À qui elle parle** : ${d.audience.trim()}`);
  if (d.promise.trim()) out.push(`- **Ce qu’elle promet** : ${d.promise.trim()}`);
  if (d.action.trim()) out.push(`- **Ce qu’on doit faire après l’avoir vue** : ${d.action.trim()}`);
  out.push('');

  out.push('## 2. Le format');
  out.push('');
  out.push(`- **Dimensions** : ${p.width} × ${p.height} pixels (${p.label})`);
  out.push(`- **Destination** : ${p.where}`);
  out.push(`- **Images par seconde** : ${d.fps}`);
  out.push(`- **Durée** : ${round1(total)} secondes`);
  out.push(`- **Images à produire** : ${frames}`);
  out.push('');

  out.push('## 3. Les scènes');
  out.push('');
  out.push('Le chronométrage commande. Chaque scène occupe exactement son intervalle, pas une image de plus.');
  out.push('');
  out.push('| # | Scène | Début | Fin | Durée | Ce qu’on voit |');
  out.push('| ---: | --- | ---: | ---: | ---: | --- |');
  scenes.forEach((s, i) => {
    const label = s.label.trim() || `Scène ${i + 1}`;
    const shows = s.shows.trim() || 'À préciser.';
    out.push(`| ${i + 1} | ${label} | ${round1(s.start)} s | ${round1(s.end)} s | ${round1(s.end - s.start)} s | ${shows} |`);
  });
  out.push('');

  if (issues.length) {
    out.push('> **Points à confirmer avec moi avant de coder :**');
    issues.forEach((i) => out.push(`> - ${i.level === 'error' ? 'Problème' : 'À vérifier'} : ${i.text}`));
    out.push('');
  }

  out.push('## 4. La charte');
  out.push('');
  out.push('Ces valeurs sont fixes. Elles ne se discutent pas, elles ne s’améliorent pas.');
  out.push('');
  out.push(`- **Couleur d’accent** : \`${d.accent}\``);
  out.push(`- **Couleur de fond** : \`${d.bg}\``);
  out.push(`- **Couleur du texte** : \`${d.ink}\``);
  if (d.fontTitle.trim()) out.push(`- **Police des titres** : ${d.fontTitle.trim()}`);
  if (d.fontBody.trim()) out.push(`- **Police du texte** : ${d.fontBody.trim()}`);
  out.push('');
  out.push('Déclare chaque couleur une seule fois, comme variable CSS sur `:root`. Je veux pouvoir en changer une et la voir changer dans toutes les scènes.');
  out.push('');
  out.push('Embarque les fichiers de police dans le dossier et charge-les en `@font-face`. Pas de police appelée depuis internet : le rendu doit marcher hors ligne et donner le même résultat dans six mois.');
  out.push('');

  if (d.forbidden.trim()) {
    out.push('## 5. Zones interdites');
    out.push('');
    out.push(d.forbidden.trim());
    out.push('');
    out.push('Rien d’important ne doit se trouver dans ces zones : elles sont couvertes par l’interface de la plateforme ou réservées à un autre élément.');
    out.push('');
  }

  out.push(`## ${d.forbidden.trim() ? '6' : '5'}. Règles non négociables`);
  out.push('');
  out.push('1. **Une fonction globale `render(t)`** qui dessine l’instant `t` en secondes. Je dois pouvoir taper `render(8)` dans la console et voir la seconde huit.');
  out.push('2. **`render(t)` est déterministe.** Pas d’animation CSS qui joue toute seule, pas d’horloge réelle, pas de hasard non semé. Deux appels avec le même `t` donnent exactement la même image.');
  out.push('3. **Attendre les polices avant la première capture** (`document.fonts.ready`). Sans ça, les premières images sortent dans la mauvaise police.');
  out.push('4. **Sortir la vidéo en `-pix_fmt yuv420p`.** Sans ça, le fichier se lit sur mon ordinateur et nulle part ailleurs.');
  out.push(`5. **La fenêtre de rendu fait exactement ${p.width} × ${p.height}.** Pas de mise à l’échelle, pas de marge ajoutée.`);
  out.push('6. **Signale-moi tout échec au lieu de l’inventer.** Si une police manque, si une image ne charge pas, si une scène ne tient pas dans son intervalle, dis-le. Une pub silencieusement fausse coûte plus cher qu’une pub en retard.');
  if (d.rules.trim()) {
    out.push('');
    out.push('En plus, pour cette pub :');
    out.push('');
    out.push(d.rules.trim());
  }
  out.push('');

  out.push(`## ${d.forbidden.trim() ? '7' : '6'}. Ce que je veux en sortie`);
  out.push('');
  out.push('Deux fichiers, dans le dossier courant.');
  out.push('');
  out.push(`**\`index.html\`** : la pub entière, autonome, ${p.width} × ${p.height}, avec la fonction \`render(t)\` et le tableau des scènes lisible en haut du script.`);
  out.push('');
  out.push('**`render.py`** : ouvre `index.html` dans un navigateur sans fenêtre, attend les polices, appelle `render(t)` image par image, capture, et empile le tout en MP4 via ffmpeg.');
  out.push('');
  out.push('Utilisation attendue :');
  out.push('');
  out.push('```bash');
  out.push(`python render.py pub.mp4 0 ${round1(total)}`);
  out.push('```');
  out.push('');
  out.push(`Résultat : \`pub.mp4\`, ${round1(total)} secondes, ${d.fps} images par seconde, sans son.`);
  out.push('');

  out.push(`## ${d.forbidden.trim() ? '8' : '7'}. Avant que je diffuse`);
  out.push('');
  out.push('- [ ] Ouvrir la vidéo sur un téléphone, pas seulement sur l’ordinateur.');
  out.push('- [ ] Regarder les trois premières secondes sans le son : l’accroche tient-elle toute seule ?');
  out.push('- [ ] Vérifier que l’appel à l’action reste lisible jusqu’à la dernière image.');
  out.push('- [ ] Comparer les couleurs sorties avec la charte, à l’œil, côte à côte.');
  out.push('- [ ] Relire le rapport rendu par la machine, en entier, y compris ce qui a raté.');
  out.push('');

  out.push('---');
  out.push('');
  out.push('_Ce brief couvre le décor : du brief à l’animation rendue. La voix off, le tournage réel, le son et le mixage sont un autre travail, et il est plus long._');
  out.push('');
  out.push('_DKM Learning Hub · apprendre, documenter, construire._');
  out.push('');
  return out.join('\n');
}

/** Résumé minimal envoyé au webhook. Jamais le brief complet. */
export function buildLeadSummary(d: Draft) {
  const p = platformOf(d);
  return {
    brand: d.brand.trim() || null,
    product: d.product.trim() || null,
    platform: p.id,
    format: `${p.width}x${p.height}`,
    fps: d.fps,
    duration: round1(duration(d)),
    sceneCount: d.scenes.length,
    issues: checkTiming(d).length,
  };
}
