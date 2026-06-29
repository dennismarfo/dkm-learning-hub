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
    status: 'Prototype mobile + backend',
    problem: 'Lire ou écouter la Bible soulève souvent des questions en plein passage, mais l’utilisateur doit quitter son moment de lecture pour chercher ailleurs.',
    goal: 'Créer une app mobile où l’on peut lire ou écouter la Bible, mettre en pause, puis poser une question contextuelle sur le chapitre ou le verset en cours.',
    stack: ['React Native', 'Expo', 'TypeScript', 'Express', 'Claude', 'Whisper'],
    learning: 'Un bon produit spirituel doit protéger le moment de réflexion : l’IA doit aider à comprendre le texte sans remplacer le discernement ni la source biblique.',
    nextStep: 'Stabiliser le parcours lecture audio + question/réponse, puis valider les sources citées et l’expérience FR/EN.',
    resource: 'Documentation Selah : architecture mobile, backend, Q&A Claude et modèles de données',
  },
  {
    slug: 'rhythm-bible-video-pipeline',
    title: 'Rhythm & Bible FR / Pipeline vidéo IA',
    category: 'Technique & R&D',
    status: 'Pipeline produit en construction',
    problem: 'Transformer un verset biblique en vidéo musicale YouTube ou Short demande plusieurs étapes lentes : analyse, musique, transcription, visuels, rendu et publication.',
    goal: 'Construire un pipeline qui part d’un verset, génère l’analyse, la musique, les scènes, les sous-titres karaoké et le rendu vidéo prêt pour YouTube/Shorts.',
    stack: ['Next.js', 'Remotion', 'Supabase', 'Groq', 'Suno', 'Whisper', 'Imagen', 'YouTube API'],
    learning: 'La génération vidéo IA devient sérieuse seulement quand chaque étape est traçable : prompt, audio, timing, scènes, rendu, métadonnées et contrôle qualité.',
    nextStep: 'Documenter le workflow complet comme ressource Learning Hub : architecture pipeline, checklist qualité et points de contrôle humains.',
    resource: 'Rhythm & Bible FR : pipeline verset → musique → karaoke → Remotion → YouTube',
  },
  {
    slug: 'nextmove-klaris',
    title: 'Next Move / Klaris',
    category: 'Business / client',
    status: 'Projet client en validation',
    problem: 'Pour un client immobilier, les demandes entrantes peuvent perdre de la valeur si la qualification, le suivi et le transfert vers le bon courtier ne sont pas structurés.',
    goal: 'Construire un assistant vocal et un système de suivi client qui qualifient les prospects, résument les besoins et gardent une trace exploitable dans le CRM.',
    stack: ['VAPI', 'n8n', 'Supabase', 'CRM', 'Scripts de qualification', 'Relances automatisées'],
    learning: 'Un projet client IA demande plus qu’un prototype : il faut un playbook clair, des statuts fiables, une logique d’escalade humaine et une gestion prudente des données.',
    nextStep: 'Définir ce qui peut être montré publiquement sans exposer d’information client, puis transformer le cas en fiche pédagogique sur la qualification IA.',
    resource: 'Cas client Klaris : agent vocal immobilier + structure prospects/relances Next Move',
  },
];
