import { useState } from 'react';
import { Demo } from './Demo';

// Available MCP servers and the tools they expose, verbatim from the source demo.
const SERVERS = [
  { id: 'fs', nm: 'Système de fichiers', ds: 'Lire et écrire des fichiers locaux', tools: ['lire_fichier', 'ecrire_fichier', 'lister_dossier'] },
  { id: 'gh', nm: 'GitHub', ds: 'Dépôts, issues, pull requests', tools: ['lister_issues', 'lire_depot', 'creer_pr'] },
  { id: 'db', nm: 'Base de données', ds: 'Interroger une base SQL', tools: ['requete_sql', 'lister_tables'] },
  { id: 'web', nm: 'Navigateur web', ds: 'Ouvrir et lire des pages', tools: ['ouvrir_url', 'lire_page'] },
];

export function McpServers({ title, intro }: { title: string; intro: string }) {
  const [on, setOn] = useState<Record<string, boolean>>({});
  const active = SERVERS.filter((s) => on[s.id]);

  return (
    <Demo title={title} intro={intro}>
      <div className="mcp-grid">
        {SERVERS.map((s) => (
          <button key={s.id} className={`srv reset ${on[s.id] ? 'on' : ''}`} onClick={() => setOn((o) => ({ ...o, [s.id]: !o[s.id] }))}>
            <div className="srv-nm">{s.nm}<span className="srv-toggle">{on[s.id] ? 'connecté' : 'éteint'}</span></div>
            <div className="srv-ds">{s.ds}</div>
          </button>
        ))}
      </div>
      <div className="mcp-tools-h">Outils exposés au modèle</div>
      <div className="mcp-tools">
        {active.length === 0 ? (
          <span className="demo-muted">Aucun serveur connecté.</span>
        ) : (
          active.flatMap((s) => s.tools.map((t) => <span className="toolchip" key={t}>{t}()</span>))
        )}
      </div>
    </Demo>
  );
}
