/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Webhook (n8n) recevant le courriel + résumé de l'outil Anatomie. Absent = pas de capture. */
  readonly VITE_ANATOMIE_WEBHOOK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
