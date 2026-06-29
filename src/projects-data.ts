export type ProjectLab = {
  slug: string;
  title: string;
  category: 'Personnel & créatif' | 'Business / client' | 'Technique & R&D';
  status: string;
  problem: string;
  goal: string;
  stack: string[];
  learning: string;
  nextStep: string;
  resource: string;
};

export const projects: ProjectLab[] = [
  {
    slug: 'selah',
    title: 'Selah',
    category: 'Personnel & créatif',
    status: 'Concept / exploration produit',
    problem: 'Créer un espace numérique plus intentionnel autour de la foi, de la réflexion et de l’édification personnelle.',
    goal: 'Transformer une intuition spirituelle en produit simple, utile et documenté avant de complexifier la stack.',
    stack: ['React', 'Supabase', 'IA générative', 'Design DKM'],
    learning: 'Clarifier la promesse avant les fonctionnalités : un bon produit commence par un usage récurrent précis.',
    nextStep: 'Définir le premier rituel utilisateur et le format de contenu minimum viable.',
    resource: 'Soul Document + fiche de cadrage produit',
  },
  {
    slug: 'ai-video-pipeline',
    title: 'Pipeline IA Shorts / YouTube',
    category: 'Technique & R&D',
    status: 'Prototype avancé',
    problem: 'Produire régulièrement des vidéos courtes et longues demande trop de temps si tout reste manuel.',
    goal: 'Orchestrer analyse, script, voix, visuels, montage et publication dans un pipeline réutilisable.',
    stack: ['Claude', 'Whisper', 'Remotion', 'n8n', 'Supabase', 'YouTube API'],
    learning: 'L’automatisation vidéo exige des points de contrôle humains : narration, rythme, visuel et cohérence de marque.',
    nextStep: 'Documenter le workflow en template réutilisable avec checklist qualité avant publication.',
    resource: 'Checklist production vidéo IA + template workflow',
  },
  {
    slug: 'nextmove-klaris',
    title: 'Next Move / Klaris',
    category: 'Business / client',
    status: 'Cas d’usage business en cadrage',
    problem: 'Les courtiers et équipes immobilières perdent des opportunités quand la qualification et le suivi sont irréguliers.',
    goal: 'Construire un assistant vocal et un système de suivi qui améliorent la réactivité sans mélanger les univers OptiAI et Next Move.',
    stack: ['VAPI', 'n8n', 'CRM', 'Supabase', 'Scripts de qualification'],
    learning: 'Un agent IA business doit être cadré par un playbook clair : contexte, limites, ton, critères de transfert humain.',
    nextStep: 'Formaliser le parcours prospect et les critères de succès avant toute automatisation lourde.',
    resource: 'Playbook qualification + grille ROI automatisation',
  },
];
