// Événements Web Analytics (Vercel). Le script est chargé depuis index.html ;
// window.va est un stub qui met en file d'attente si le script n'est pas (encore) là.
// Aucune donnée personnelle : seulement le nom de l'événement et de petites propriétés.
type Props = Record<string, string | number | boolean>;

declare global {
  interface Window {
    va?: (event: 'event', payload: { name: string; data?: Props }) => void;
  }
}

export function track(name: string, data?: Props) {
  try {
    window.va?.('event', { name, data });
  } catch {
    /* jamais bloquant */
  }
}
