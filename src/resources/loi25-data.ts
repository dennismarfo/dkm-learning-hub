/* ============================================================
   Checklist Loi 25 : l'IA et les données de tes clients
   Contenu vérifié le 26 sept. 2026 contre la Loi sur la protection
   des renseignements personnels dans le secteur privé (RLRQ c. P-39.1)
   et les pages de la Commission d'accès à l'information (CAI).
   Toute question est formulée pour que « Oui » = conforme.
   ============================================================ */

export type Answer = 'oui' | 'non' | 'nsp';
export type SectionId = 'outil' | 'entreprise';

export type Item = {
  id: string;
  section: SectionId;
  /** l'affirmation à laquelle on répond Oui / Non / Je ne sais pas */
  q: string;
  /** article(s) de la P-39.1 */
  art: string;
  why: string;
  how: string;
  fix: string;
};

export const STORAGE_KEY = 'dkm.loi25.v1';

export const SECTIONS: { id: SectionId; code: string; title: string; intro: string }[] = [
  {
    id: 'outil',
    code: 'A',
    title: 'Ton outil IA',
    intro: 'Ce que fait le fournisseur avec ce que tu lui confies. Ouvre ses paramètres et sa politique de confidentialité à côté.',
  },
  {
    id: 'entreprise',
    code: 'B',
    title: 'Ton entreprise',
    intro: 'Ce que la loi te demande à toi, peu importe l’outil. Ça s’applique aussi aux entreprises d’une seule personne.',
  },
];

export const ITEMS: Item[] = [
  {
    id: 'entrainement',
    section: 'outil',
    q: 'Les données de tes clients sont exclues de l’entraînement du modèle.',
    art: 'art. 12',
    why:
      'Si le fournisseur réutilise ce que tu y mets pour entraîner ses modèles, les renseignements servent à une autre fin que celle pour laquelle tes clients te les ont donnés. Il faut alors leur consentement.',
    how:
      'Cherche « training » ou « entraînement » dans les paramètres et la politique de confidentialité. Attention : les forfaits gratuits et les forfaits pro n’ont souvent pas les mêmes règles.',
    fix:
      'Désactive l’option d’entraînement ou passe à un forfait qui l’exclut par contrat. Sinon, n’y mets aucun renseignement personnel.',
  },
  {
    id: 'hebergement',
    section: 'outil',
    q: 'Tu sais où tes données sont hébergées et traitées.',
    art: 'art. 17',
    why:
      'Si elles sortent du Québec, tu dois d’abord évaluer les facteurs relatifs à la vie privée (EFVP), t’assurer que la protection sera adéquate et encadrer le transfert par une entente écrite.',
    how:
      'Cherche « data residency », « sous-traitants » ou « subprocessors » sur le site du fournisseur. La plupart des outils IA grand public traitent les données aux États-Unis.',
    fix: 'Note le pays, fais l’EFVP du transfert (le guide de la CAI t’aide) et garde la preuve dans tes dossiers.',
  },
  {
    id: 'conservation',
    section: 'outil',
    q: 'Tu sais combien de temps l’outil garde tes données, et tu peux les supprimer.',
    art: 'art. 23',
    why:
      'Un renseignement dont tu n’as plus besoin doit être détruit ou anonymisé. Si l’outil garde tout indéfiniment, tu ne peux pas respecter cette règle.',
    how:
      'Cherche « retention » ou « conservation » dans la politique. Vérifie que tu peux supprimer une conversation, un fichier ou tout le compte.',
    fix: 'Règle la conservation au minimum et supprime ce qui ne sert plus. Mets un rappel pour le refaire.',
  },
  {
    id: 'acces',
    section: 'outil',
    q: 'Tu sais qui, chez le fournisseur, peut consulter tes données.',
    art: 'art. 18.3',
    why:
      'Ton fournisseur agit pour toi. Ce que tu lui confies ne doit servir qu’au service rendu, et l’accès doit se limiter à ce qui est nécessaire.',
    how:
      'Cherche si des employés peuvent lire les conversations (révision humaine, sécurité, soutien technique) et dans quels cas.',
    fix: 'Désactive la révision humaine si l’option existe, ou choisis un forfait entreprise qui l’encadre par écrit.',
  },
  {
    id: 'contrat',
    section: 'outil',
    q: 'Tu as une entente écrite avec le fournisseur sur la protection des données.',
    art: 'art. 18.3 et 17',
    why:
      'Tu peux confier des renseignements à un prestataire sans le consentement de tes clients seulement si un contrat écrit précise les mesures de protection, l’usage limité au mandat et la destruction à la fin.',
    how:
      'Cherche un « DPA » (Data Processing Agreement, entente de traitement des données) ou des conditions entreprise. Les conditions d’utilisation grand public ne suffisent souvent pas.',
    fix:
      'Accepte ou signe le DPA du fournisseur et garde-en une copie. S’il n’en offre pas, n’utilise pas cet outil pour les données clients.',
  },
  {
    id: 'responsable',
    section: 'entreprise',
    q: 'Un responsable de la protection des renseignements personnels est désigné, et ses coordonnées sont publiées.',
    art: 'art. 3.1',
    why:
      'Par défaut, c’est la personne qui a la plus haute autorité dans l’entreprise, donc souvent toi. Son titre et ses coordonnées doivent être publiés sur ton site.',
    how: 'Va sur ton site comme un client : trouves-tu en moins d’une minute qui contacter pour tes renseignements personnels ?',
    fix: 'Ajoute le titre et un courriel dans ta politique de confidentialité. Si tu délègues ce rôle, fais-le par écrit.',
  },
  {
    id: 'efvp',
    section: 'entreprise',
    q: 'Tu as fait une évaluation des facteurs relatifs à la vie privée (EFVP) pour ce projet IA.',
    art: 'art. 3.3',
    why:
      'Tout projet d’acquisition, de développement ou de refonte d’un système qui traite des renseignements personnels demande une EFVP. Brancher un outil IA sur tes données clients en est un.',
    how:
      'Pour une petite entreprise, une EFVP peut tenir en quelques pages : quelles données, pourquoi, quels risques, quelles mesures.',
    fix: 'Suis le guide EFVP de la CAI, proportionne l’exercice à la sensibilité des données et garde le document.',
  },
  {
    id: 'information',
    section: 'entreprise',
    q: 'Tes clients sont informés, au moment de la collecte, de ce que tu fais de leurs renseignements, IA comprise.',
    art: 'art. 8',
    why:
      'Tu dois leur dire à quelles fins et par quels moyens tu recueilles leurs renseignements, et s’ils peuvent être communiqués à l’extérieur du Québec. Un appel enregistré ou transcrit par une IA doit être annoncé.',
    how: 'Relis ta politique de confidentialité, tes formulaires et le message d’accueil de ta ligne téléphonique.',
    fix: 'Ajoute une mention claire : quel outil, pour quoi faire, où vont les données. Annonce l’enregistrement dès le début de l’appel.',
  },
  {
    id: 'decision',
    section: 'entreprise',
    q: 'Aucune décision sur un client n’est prise uniquement par l’IA, ou la personne en est informée.',
    art: 'art. 12.1',
    why:
      'Si une décision est fondée exclusivement sur un traitement automatisé, tu dois en informer la personne et lui permettre de présenter ses observations.',
    how:
      'Liste ce que ton IA décide seule. Trier des courriels, ce n’est pas une décision sur une personne. Refuser un dossier ou fixer un prix, oui.',
    fix: 'Garde un humain dans la boucle pour ces décisions, ou prévois l’avis et un moyen simple de les contester.',
  },
  {
    id: 'incident',
    section: 'entreprise',
    q: 'Tu sais quoi faire en cas de fuite ou d’accès non autorisé à tes données.',
    art: 'art. 3.5 à 3.8',
    why:
      'En cas d’incident de confidentialité, tu dois réduire les risques, aviser la Commission d’accès à l’information et les personnes concernées si le risque de préjudice est sérieux, et tenir un registre des incidents.',
    how: 'Demande-toi : si ton compte IA était piraté demain, qui préviens-tu, et où l’écris-tu ?',
    fix: 'Crée un registre simple (date, ce qui s’est passé, données touchées, mesures prises) et note la marche à suivre.',
  },
];

export const ANSWERS: { id: Answer; label: string }[] = [
  { id: 'oui', label: 'Oui' },
  { id: 'non', label: 'Non' },
  { id: 'nsp', label: 'Je ne sais pas' },
];

export const SANCTIONS = [
  'Sanctions administratives pécuniaires : jusqu’à 10 M$ ou 2 % du chiffre d’affaires mondial, le montant le plus élevé.',
  'Amendes pénales : de 15 000 $ à 25 M$ ou 4 % du chiffre d’affaires mondial, le montant le plus élevé.',
];

export const SOURCES: { label: string; url: string }[] = [
  {
    label: 'Loi sur la protection des renseignements personnels dans le secteur privé (RLRQ c. P-39.1)',
    url: 'https://www.legisquebec.gouv.qc.ca/fr/document/lc/P-39.1',
  },
  {
    label: 'CAI : principaux changements apportés par la Loi 25',
    url: 'https://www.cai.gouv.qc.ca/protection-renseignements-personnels/sujets-et-domaines-dinteret/principaux-changements-loi-25',
  },
  { label: 'CAI : guide d’accompagnement pour réaliser une EFVP', url: 'https://www.cai.gouv.qc.ca/uploads/pdfs/CAI_GU_EFVP.pdf' },
  {
    label: 'CAI : cadre général d’application des sanctions administratives pécuniaires',
    url: 'https://www.cai.gouv.qc.ca/uploads/pdfs/CAI_Cadre_Sanct_Pecun.pdf',
  },
];

export const DISCLAIMER =
  'Cette checklist t’aide à faire le point. Ce n’est pas un avis juridique : pour une situation précise, consulte un avocat ou la Commission d’accès à l’information.';

export type Check = { tool: string; answers: Partial<Record<string, Answer>>; startedAt: string };

export const emptyCheck = (): Check => ({ tool: '', answers: {}, startedAt: new Date().toISOString() });

export function tally(c: Check) {
  const by = (a: Answer) => ITEMS.filter((it) => c.answers[it.id] === a);
  const oui = by('oui');
  const non = by('non');
  const nsp = by('nsp');
  return { oui, non, nsp, answered: oui.length + non.length + nsp.length, total: ITEMS.length };
}

export function verdict(score: number, total: number): { title: string; body: string } {
  if (score === total)
    return { title: 'Tu es en bonne posture.', body: 'Garde tes preuves (EFVP, entente, registre) à jour, et refais le point à chaque nouvel outil.' };
  if (score >= total - 3)
    return { title: 'Presque.', body: 'Quelques points à régler. Commence par les « Non », puis vérifie les « Je ne sais pas ».' };
  if (score >= Math.ceil(total / 2) - 1)
    return { title: 'Des trous importants.', body: 'Rien d’insurmontable, mais règle la liste ci-dessous avant d’ajouter d’autres données clients dans ton outil.' };
  return {
    title: 'Priorité : régler ça d’abord.',
    body: 'Mets les données de tes clients sur pause dans l’outil le temps de régler les points ci-dessous, en commençant par l’entente et l’entraînement.',
  };
}

/* ---------- rapport Markdown ---------- */

const fmtDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return iso.slice(0, 10);
  }
};

const LABEL: Record<Answer, string> = { oui: 'Oui', non: 'Non', nsp: 'Je ne sais pas' };

export function buildReport(c: Check): string {
  const t = tally(c);
  const tool = c.tool.trim() || 'mon outil IA';
  const v = verdict(t.oui.length, t.total);
  const todo = [...t.non, ...t.nsp];
  const L: string[] = [];
  L.push(`# Checklist Loi 25 : ${tool}`);
  L.push('');
  L.push(`Faite le ${fmtDate(new Date().toISOString())} · DKM Learning Hub`);
  L.push('');
  L.push(`**Résultat : ${t.oui.length}/${t.total} conformes.** ${v.title} ${v.body}`);
  L.push('');
  if (todo.length) {
    L.push('## Prompt pour ton IA');
    L.push('');
    L.push('```text');
    L.push(
      `Je suis une petite entreprise au Québec et j'utilise ${tool} avec des renseignements personnels de mes clients. ` +
        'Voici ma checklist Loi 25. Pour chaque point « À régler » ou « À vérifier », dis-moi concrètement quoi faire cette semaine, ' +
        "dans quel ordre, et quels documents garder comme preuve. Ne me donne pas d'avis juridique : signale-moi ce qui mérite un avocat.",
    );
    L.push('```');
    L.push('');
  }
  for (const s of SECTIONS) {
    L.push(`## ${s.code}. ${s.title}`);
    L.push('');
    for (const it of ITEMS.filter((i) => i.section === s.id)) {
      const a = c.answers[it.id];
      L.push(`- **${a ? LABEL[a] : 'Sans réponse'}** · ${it.q} _(${it.art})_`);
    }
    L.push('');
  }
  if (todo.length) {
    L.push('## À régler');
    L.push('');
    for (const it of todo) {
      const tag = c.answers[it.id] === 'non' ? 'À régler' : 'À vérifier';
      L.push(`### ${tag} : ${it.q}`);
      L.push('');
      L.push(`- Pourquoi (${it.art}) : ${it.why}`);
      L.push(`- Comment vérifier : ${it.how}`);
      L.push(`- Quoi faire : ${it.fix}`);
      L.push('');
    }
  }
  L.push('## Ce que tu risques');
  L.push('');
  for (const s of SANCTIONS) L.push(`- ${s}`);
  L.push('- Les plafonds visent les grandes entreprises, mais les obligations s’appliquent à toutes, peu importe la taille.');
  L.push('');
  L.push('## Et après ?');
  L.push('');
  L.push(
    'La conformité, c’est le cadre. Pour savoir quoi confier à l’IA en premier, fais l’anatomie de ton entreprise (gratuit, 30 minutes) : https://dkm-learning-hub.vercel.app/anatomie',
  );
  L.push('');
  L.push('## Sources');
  L.push('');
  for (const s of SOURCES) L.push(`- [${s.label}](${s.url})`);
  L.push('');
  L.push(`_${DISCLAIMER}_`);
  L.push('');
  return L.join('\n');
}
