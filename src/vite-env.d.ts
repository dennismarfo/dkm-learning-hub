/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Webhook (n8n) recevant le courriel + résumé de l'outil Anatomie. Absent = pas de capture. */
  readonly VITE_ANATOMIE_WEBHOOK_URL?: string;
  /** Webhook (n8n) recevant le courriel + résumé de la ressource « La pub en dix minutes ». Absent = pas de capture. */
  readonly VITE_PUB_WEBHOOK_URL?: string;
  /** Webhook (n8n) recevant les votes anonymes (sujet + horodatage, aucune donnée personnelle). Absent = le vote reste compté dans Vercel Analytics. */
  readonly VITE_VOTE_WEBHOOK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
