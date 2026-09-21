import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { go } from '../nav';
import { Brand, Button } from '../components';
import {
  FAILURES,
  FPS_CHOICES,
  GUIDE,
  HONESTY,
  PLATFORMS,
  PREREQS,
  SETTINGS,
  STORAGE_KEY,
  checkTiming,
  duration,
  emptyDraft,
  frameCount,
  isUsable,
  newScene,
  platformOf,
  round1,
  type Draft,
  type PlatformId,
  type Scene,
} from './pub-motion-data';
import { buildBrief, buildLeadSummary, slugify } from './pub-motion-brief';
import { track } from '../analytics';

/* ============================================================
   La pub en dix minutes · ressource gratuite
   guide → générateur (4 étapes) → (capture courriel) → brief
   - 100 % client : le brouillon vit dans localStorage, rien ne
     part hors du navigateur sauf, si un webhook est configuré
     au build (VITE_PUB_WEBHOOK_URL), le courriel + un résumé.
   - export .md natif (Blob), copie presse-papier, impression
   - la navigation vers le reste du Hub est active : cette page
     est la porte d'entrée du Reel « PUB » et doit renvoyer vers
     l'anatomie et vers le tutoriel complet.
   ============================================================ */

type Screen = { kind: 'guide' } | { kind: 'step'; i: number } | { kind: 'lead' } | { kind: 'brief' };

const STEPS = ['La pub', 'Le format', 'Les scènes', 'La charte'];

const WEBHOOK = (import.meta.env.VITE_PUB_WEBHOOK_URL as string | undefined)?.trim() || '';
const LEAD_KEY = 'dkm.pub-motion.lead';

function leadDone(): boolean {
  try {
    return window.localStorage.getItem(LEAD_KEY) === '1';
  } catch {
    return false;
  }
}

function normalizeScreen(raw: unknown): Screen {
  const guide: Screen = { kind: 'guide' };
  if (!raw || typeof raw !== 'object') return guide;
  const s = raw as { kind?: unknown; i?: unknown };
  switch (s.kind) {
    case 'step': {
      const i = typeof s.i === 'number' && Number.isInteger(s.i) ? s.i : -1;
      return i >= 0 && i < STEPS.length ? { kind: 'step', i } : guide;
    }
    case 'lead':
      return WEBHOOK && !leadDone() ? { kind: 'lead' } : { kind: 'brief' };
    case 'brief':
      return { kind: 'brief' };
    default:
      return guide;
  }
}

function load(): { draft: Draft; screen: Screen; resume: Screen | null } {
  const fresh = { draft: emptyDraft(), screen: { kind: 'guide' } as Screen, resume: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh;
    const parsed = JSON.parse(raw) as { draft?: Partial<Draft>; screen?: unknown };
    if (!parsed.draft || typeof parsed.draft !== 'object') return fresh;
    const pd = parsed.draft;
    const base = emptyDraft();
    const str = (v: unknown, fb: string) => (typeof v === 'string' ? v : fb);
    const scenes: Scene[] = Array.isArray(pd.scenes)
      ? pd.scenes
          .filter((s): s is Scene => !!s && typeof s === 'object' && typeof (s as Scene).id === 'string')
          .map((s) => ({
            id: s.id,
            label: str(s.label, ''),
            start: Number.isFinite(s.start) ? Number(s.start) : 0,
            end: Number.isFinite(s.end) ? Number(s.end) : 0,
            shows: str(s.shows, ''),
          }))
      : base.scenes;
    const platform = PLATFORMS.some((p) => p.id === pd.platform)
      ? (pd.platform as PlatformId)
      : base.platform;
    const draft: Draft = {
      ...base,
      brand: str(pd.brand, ''),
      product: str(pd.product, ''),
      audience: str(pd.audience, ''),
      promise: str(pd.promise, ''),
      action: str(pd.action, ''),
      platform,
      fps: FPS_CHOICES.includes(Number(pd.fps)) ? Number(pd.fps) : base.fps,
      scenes: scenes.length ? scenes : base.scenes,
      accent: str(pd.accent, base.accent),
      bg: str(pd.bg, base.bg),
      ink: str(pd.ink, base.ink),
      fontTitle: str(pd.fontTitle, ''),
      fontBody: str(pd.fontBody, ''),
      forbidden: str(pd.forbidden, ''),
      rules: str(pd.rules, ''),
      startedAt: str(pd.startedAt, base.startedAt),
    };
    // L'URL mène toujours au guide : le brouillon est conservé, et le guide propose « Reprendre ».
    const restored = normalizeScreen(parsed.screen);
    return { draft, screen: { kind: 'guide' }, resume: restored.kind === 'guide' ? null : restored };
  } catch {
    return fresh;
  }
}

function save(draft: Draft, screen: Screen) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ draft, screen }));
  } catch {
    /* stockage indisponible : l'outil reste utilisable */
  }
}

/* ---------- petits composants ---------- */

function Field({
  id,
  label,
  hint,
  value,
  placeholder,
  onChange,
  area,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  area?: boolean;
}) {
  return (
    <div className="soul-field">
      <label className="soul-label" htmlFor={id}>
        {label}
      </label>
      {area ? (
        <textarea
          id={id}
          className="soul-textarea"
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input id={id} className="soul-input" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <p className="soul-hint">{hint}</p>}
    </div>
  );
}

function Swatch({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="pub-swatch">
      <label className="soul-label" htmlFor={id}>
        {label}
      </label>
      <div className="pub-swatch-row">
        <input
          id={id}
          type="color"
          className="pub-color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label}, sélecteur`}
        />
        <input
          className="soul-input pub-hex"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label}, code hexadécimal`}
          spellCheck={false}
        />
      </div>
    </div>
  );
}

function SceneRow({
  s,
  i,
  onChange,
  onRemove,
}: {
  s: Scene;
  i: number;
  onChange: (p: Partial<Scene>) => void;
  onRemove?: () => void;
}) {
  const num = (v: string) => {
    const n = Number(v.replace(',', '.'));
    return Number.isFinite(n) && n >= 0 ? round1(n) : 0;
  };
  return (
    <div className="pub-scene">
      <div className="pub-scene-head">
        <span className="pub-num">{i + 1}</span>
        <input
          className="soul-input pub-scene-label"
          value={s.label}
          placeholder="Nom de la scène"
          onChange={(e) => onChange({ label: e.target.value })}
          aria-label={`Nom de la scène ${i + 1}`}
        />
        <div className="pub-times">
          <label className="pub-time">
            <span>début</span>
            <input
              type="number"
              min={0}
              step={0.1}
              value={s.start}
              onChange={(e) => onChange({ start: num(e.target.value) })}
              aria-label={`Seconde de début, scène ${i + 1}`}
            />
          </label>
          <label className="pub-time">
            <span>fin</span>
            <input
              type="number"
              min={0}
              step={0.1}
              value={s.end}
              onChange={(e) => onChange({ end: num(e.target.value) })}
              aria-label={`Seconde de fin, scène ${i + 1}`}
            />
          </label>
          <span className="pub-dur">{round1(Math.max(0, s.end - s.start))} s</span>
        </div>
        {onRemove && (
          <button type="button" className="ana-task-remove reset" onClick={onRemove} aria-label={`Retirer la scène ${i + 1}`}>
            ✕
          </button>
        )}
      </div>
      <textarea
        className="soul-textarea pub-scene-shows"
        rows={2}
        value={s.shows}
        placeholder="Ce qu’on voit. Une phrase, concrète."
        onChange={(e) => onChange({ shows: e.target.value })}
        aria-label={`Ce qu’on voit, scène ${i + 1}`}
      />
    </div>
  );
}

function Timeline({ d }: { d: Draft }) {
  const total = duration(d);
  if (!total) return null;
  const scenes = [...d.scenes].sort((a, b) => a.start - b.start);
  return (
    <div className="pub-timeline" aria-hidden="true">
      {scenes.map((s, i) => (
        <span
          key={s.id}
          className={`pub-seg t${i % 3}`}
          style={{ left: `${(s.start / total) * 100}%`, width: `${(Math.max(0, s.end - s.start) / total) * 100}%` }}
        >
          <b>{s.label || i + 1}</b>
        </span>
      ))}
    </div>
  );
}

/* ---------- la page ---------- */

export default function PubMotion() {
  const [{ draft, screen, resume }, setState] = useState(load);
  const [copied, setCopied] = useState(false);
  const [lead, setLead] = useState({ name: '', email: '', consent: false });
  const [leadState, setLeadState] = useState<'idle' | 'sending' | 'error'>('idle');

  useEffect(() => save(draft, screen), [draft, screen]);

  const setDraft = (patch: Partial<Draft>) => setState((s) => ({ ...s, draft: { ...s.draft, ...patch } }));
  const setScreen = (screen: Screen) => {
    setState((s) => ({ ...s, screen }));
    window.scrollTo({ top: 0 });
  };

  const issues = useMemo(() => checkTiming(draft), [draft]);
  const md = useMemo(() => buildBrief(draft), [draft]);
  const platform = platformOf(draft);
  const total = duration(draft);

  const updateScene = (id: string, p: Partial<Scene>) =>
    setState((s) => ({ ...s, draft: { ...s.draft, scenes: s.draft.scenes.map((x) => (x.id === id ? { ...x, ...p } : x)) } }));

  const addScene = () => {
    const sortedByEnd = [...draft.scenes].sort((a, b) => a.end - b.end);
    const last = sortedByEnd[sortedByEnd.length - 1];
    const start = last ? last.end : 0;
    setDraft({ scenes: [...draft.scenes, newScene('', start, start + 3, '')] });
  };

  const removeScene = (id: string) => setDraft({ scenes: draft.scenes.filter((x) => x.id !== id) });

  const restart = () => {
    setState({ draft: emptyDraft(), screen: { kind: 'guide' }, resume: null });
    setCopied(false);
  };

  const copy = async () => {
    track('pub_copy');
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const download = () => {
    track('pub_download');
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brief-pub-${slugify(draft.brand, 'ma-marque')}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const goToBrief = () => {
    track('pub_brief', { scenes: draft.scenes.length, duration: round1(total), issues: issues.length });
    if (WEBHOOK && !leadDone()) setScreen({ kind: 'lead' });
    else setScreen({ kind: 'brief' });
  };

  const sendLead = async () => {
    if (!lead.email.trim() || !lead.consent) return;
    setLeadState('sending');
    try {
      const res = await fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'pub-motion',
          name: lead.name.trim() || null,
          email: lead.email.trim(),
          consent: true,
          summary: buildLeadSummary(draft),
          sentAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      try {
        window.localStorage.setItem(LEAD_KEY, '1');
      } catch {
        /* ignore */
      }
      setLeadState('idle');
      track('pub_lead');
      setScreen({ kind: 'brief' });
    } catch {
      setLeadState('error');
    }
  };

  /* ----- coquille ----- */

  const shell = (children: ReactNode, wide = false) => (
    <main className={`wrap section soul-shell ana-shell ${wide ? 'ana-wide' : ''}`}>
      <div className="ana-top">
        <Brand />
        <button className="reset soul-back" onClick={() => go('/resources')}>
          ← Retour aux ressources
        </button>
      </div>
      {children}
    </main>
  );

  const stepper = (i: number) => (
    <ol className="ana-steps" aria-label="Progression">
      {STEPS.map((s, k) => (
        <li key={s} className={`ana-step ${k === i ? 'on' : ''} ${k < i ? 'done' : ''}`}>
          <button type="button" className="reset" onClick={() => setScreen({ kind: 'step', i: k })} title={s} aria-label={s}>
            {k + 1}
          </button>
        </li>
      ))}
    </ol>
  );

  /* ----- le guide ----- */

  if (screen.kind === 'guide') {
    return shell(
      <>
        <section className="hero ana-hero">
          <div className="eyebrow">Ressource · gratuite</div>
          <h1 className="display h1 ana-h1">La pub en dix minutes.</h1>
          <p className="lead">
            Pas d’agence, pas de monteur, pas de logiciel de montage. Une page web, un programme de seize lignes qui la
            filme, et un brief que tu écris toi-même. Voici comment, et ce que les dix minutes couvrent vraiment.
          </p>
        </section>

        <div className="card ana-card pub-honesty">
          <div className="eyebrow">D’abord, l’honnêteté</div>
          <h2 className="display section-title" style={{ marginTop: 8 }}>
            Dix minutes, oui. Mais pour le décor.
          </h2>
          <p className="lead" style={{ fontSize: 18 }}>
            {HONESTY.note}
          </p>
          <div className="grid grid2 pub-honesty-grid">
            <div>
              <div className="eyebrow">Ce que couvrent les dix minutes</div>
              <ul className="pub-list yes">
                {HONESTY.covers.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="eyebrow">Ce qu’elles ne couvrent pas</div>
              <ul className="pub-list no">
                {HONESTY.excludes.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="card ana-card">
          <div className="eyebrow">Avant de commencer</div>
          <h2 className="display section-title" style={{ marginTop: 8 }}>
            Trois choses à avoir sous la main.
          </h2>
          <div className="grid grid3">
            {PREREQS.map((p) => (
              <div className="card" key={p.label}>
                <h3>{p.label}</h3>
                <p>{p.why}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card ana-card">
          <div className="eyebrow">La méthode</div>
          <h2 className="display section-title" style={{ marginTop: 8 }}>
            Trois étapes, dans cet ordre.
          </h2>
          {GUIDE.map((g) => (
            <div className="pub-step" key={g.n}>
              <span className="pub-num big">{g.n}</span>
              <div>
                <h3>{g.title}</h3>
                <p className="lead" style={{ fontSize: 18 }}>
                  {g.body}
                </p>
                {g.detail && <p className="ana-hint">{g.detail}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="card dark ana-card">
          <div className="eyebrow">Les deux réglages</div>
          <h2 className="display section-title" style={{ marginTop: 8 }}>
            Ce qui sépare le pro de l’amateur.
          </h2>
          <p className="lead" style={{ fontSize: 18 }}>
            Deux lignes. Elles n’ont l’air de rien, et ce sont elles qui décident si ta pub est diffusable.
          </p>
          {SETTINGS.map((s) => (
            <div className="pub-setting" key={s.code}>
              <code className="pub-code">{s.code}</code>
              <h3>{s.title}</h3>
              <p className="pub-symptom">{s.symptom}</p>
              <p>{s.why}</p>
            </div>
          ))}
        </div>

        <div className="card ana-card">
          <div className="eyebrow">Le gabarit de départ</div>
          <h2 className="display section-title" style={{ marginTop: 8 }}>
            Deux fichiers, pour voir le circuit une fois.
          </h2>
          <p className="lead" style={{ fontSize: 18 }}>
            Trois scènes, quinze secondes, et le programme qui les filme. Ouvre la page, tape <code>render(5)</code> dans la
            console, change une couleur, lance le rendu. Ne cherche pas à faire ta pub tout de suite : fais le tour complet
            une fois, pour que le circuit devienne familier.
          </p>
          <div className="actions">
            <a className="btn" href="/gabarit-pub/index.html" target="_blank" rel="noopener">
              Ouvrir l’animation
            </a>
            <a className="btn light" href="/gabarit-pub/index.html" download="index.html">
              index.html
            </a>
            <a className="btn light" href="/gabarit-pub/render.py" download="render.py">
              render.py
            </a>
            <a className="btn light" href="/gabarit-pub/LISEZ-MOI.md" download="LISEZ-MOI.md">
              Lisez-moi
            </a>
          </div>
          <p className="ana-hint">
            Mets les trois fichiers dans le même dossier vide. Le gabarit utilise les polices du système pour marcher tout
            de suite : c’est en mettant les tiennes que le premier réglage devient indispensable.
          </p>
        </div>

        <div className="card ana-card">
          <div className="eyebrow">Ce qui rate</div>
          <h2 className="display section-title" style={{ marginTop: 8 }}>
            Les quatre erreurs que je vois le plus.
          </h2>
          <ul className="pub-list no">
            {FAILURES.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>

        <div className="card ana-card ana-start">
          <div className="eyebrow">À toi</div>
          <h2 className="display section-title" style={{ marginTop: 8 }}>
            Écris ton brief maintenant.
          </h2>
          <p className="lead" style={{ fontSize: 18 }}>
            Quatre écrans : ta pub, ton format, tes scènes, ta charte. À la fin tu repars avec un brief en Markdown, prêt à
            coller dans Claude Code. Tout reste dans ton navigateur.
          </p>
          <div className="soul-nav">
            <span className="ana-note">Environ cinq minutes. Tu peux t’arrêter et revenir.</span>
            <div className="actions" style={{ marginTop: 0 }}>
              {resume && (
                <Button
                  variant="light"
                  onClick={() => {
                    track('pub_resume');
                    setScreen(resume);
                  }}
                >
                  Reprendre où j’en étais
                </Button>
              )}
              <Button
                onClick={() => {
                  track('pub_start');
                  setScreen({ kind: 'step', i: 0 });
                }}
              >
                {resume ? 'Recommencer le brief' : 'Écrire mon brief →'}
              </Button>
            </div>
          </div>
        </div>
      </>,
    );
  }

  /* ----- la capture courriel ----- */

  if (screen.kind === 'lead') {
    const ok = /.+@.+\..+/.test(lead.email.trim()) && lead.consent;
    return shell(
      <div className="card ana-card">
        <div className="eyebrow">Une dernière chose</div>
        <h2 className="display section-title" style={{ marginTop: 8 }}>
          Où t’envoyer la suite ?
        </h2>
        <p className="lead" style={{ fontSize: 18 }}>
          Ton brief est prêt. Laisse ton courriel pour le recevoir aussi par écrit, et pour être prévenu quand le tutoriel
          complet sort. Pas de spam, tu te désabonnes en un clic.
        </p>
        <div className="soul-fields">
          <div className="soul-field">
            <label className="soul-label" htmlFor="pub-lead-name">
              Prénom
            </label>
            <input
              id="pub-lead-name"
              className="soul-input"
              value={lead.name}
              placeholder="ex. Léa"
              onChange={(e) => setLead({ ...lead, name: e.target.value })}
            />
          </div>
          <div className="soul-field">
            <label className="soul-label" htmlFor="pub-lead-email">
              Courriel
            </label>
            <input
              id="pub-lead-email"
              className="soul-input"
              type="email"
              value={lead.email}
              placeholder="toi@exemple.com"
              onChange={(e) => setLead({ ...lead, email: e.target.value })}
            />
          </div>
          <label className="ana-consent">
            <input type="checkbox" checked={lead.consent} onChange={(e) => setLead({ ...lead, consent: e.target.checked })} />
            <span>
              J’accepte de recevoir mon brief et les nouvelles du DKM Learning Hub par courriel. Seuls mon courriel, mon
              prénom et un résumé du format (durée, nombre de scènes) sont envoyés ; le contenu de ma pub reste dans mon
              navigateur.
            </span>
          </label>
        </div>
        {leadState === 'error' && (
          <p className="ana-hint">L’envoi n’a pas fonctionné. Réessaie, ou passe directement au brief : il est déjà prêt.</p>
        )}
        <div className="soul-nav">
          <Button
            variant="light"
            onClick={() => {
              track('pub_lead_skip');
              setScreen({ kind: 'brief' });
            }}
          >
            Passer, voir mon brief
          </Button>
          <Button onClick={sendLead} disabled={!ok || leadState === 'sending'}>
            {leadState === 'sending' ? 'Envoi…' : 'Recevoir et voir mon brief →'}
          </Button>
        </div>
      </div>,
    );
  }

  /* ----- le brief ----- */

  if (screen.kind === 'brief') {
    return shell(
      <div className="card ana-card ana-report">
        <div className="eyebrow">Ton brief</div>
        <h2 className="display section-title" style={{ marginTop: 8 }}>
          {round1(total)} secondes, {draft.scenes.length} scènes, {frameCount(draft)} images ✦
        </h2>
        <p className="lead" style={{ fontSize: 18, marginBottom: 20 }}>
          Télécharge-le, ouvre Claude Code dans un dossier vide, et colle-le. La consigne de démarrage est incluse en tête.
          Tu ne demandes pas une pub : tu en commandes une.
        </p>
        {issues.length > 0 && (
          <div className="pub-issues ana-print-hide">
            <div className="eyebrow">Signalé dans le brief</div>
            <ul>
              {issues.map((i, k) => (
                <li key={k} className={i.level}>
                  {i.text}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="soul-result-actions ana-print-hide">
          <Button onClick={download}>Télécharger .md</Button>
          <Button variant="light" onClick={copy}>
            {copied ? 'Copié ✓' : 'Copier le brief'}
          </Button>
          <Button
            variant="light"
            onClick={() => {
              track('pub_print');
              window.print();
            }}
          >
            Imprimer / PDF
          </Button>
          <Button variant="light" onClick={() => setScreen({ kind: 'step', i: 2 })}>
            Retour aux scènes
          </Button>
          {copied && <span className="soul-toast">Copié dans le presse-papier</span>}
        </div>
        <pre className="soul-md ana-md">{md}</pre>

        <div className="card dark pub-next ana-print-hide">
          <div className="eyebrow">La suite</div>
          <h3>Le décor est fait. Le reste demande un système.</h3>
          <p>
            Une pub, c’est une pièce. Si tu veux savoir laquelle de tes tâches mérite vraiment d’être automatisée avant de
            faire des pubs, commence par la carte de ton entreprise.
          </p>
          <div className="actions">
            <Button onClick={() => go('/resources/anatomie')}>Faire l’anatomie de mon entreprise →</Button>
          </div>
          <p className="ana-hint" style={{ marginTop: 16 }}>
            Le tutoriel complet, celui qui couvre la voix off, le tournage réel, le son et la charte, arrive. Pour être
            prévenu : @dkmarfo sur Instagram.
          </p>
        </div>

        <p className="ana-hint ana-print-hide">
          Tu veux repartir de zéro ?{' '}
          <button type="button" className="reset ana-link" onClick={restart}>
            Effacer ce brouillon
          </button>
          . Il n’existe que dans ce navigateur.
        </p>
      </div>,
      true,
    );
  }

  /* ----- les quatre étapes ----- */

  const i = screen.i;
  const next = () => (i < STEPS.length - 1 ? setScreen({ kind: 'step', i: i + 1 }) : goToBrief());
  const prev = () => (i > 0 ? setScreen({ kind: 'step', i: i - 1 }) : setScreen({ kind: 'guide' }));

  const body = () => {
    if (i === 0) {
      return (
        <div className="soul-fields">
          <Field
            id="pub-brand"
            label="Ta marque"
            value={draft.brand}
            placeholder="ex. Thermo Rive-Sud"
            onChange={(v) => setDraft({ brand: v })}
          />
          <Field
            id="pub-product"
            label="Ce que tu vends, dans cette pub"
            hint="Une pub, une offre. Si tu en mets deux, personne n’en retient aucune."
            value={draft.product}
            placeholder="ex. L’installation de thermopompes en 48 h"
            onChange={(v) => setDraft({ product: v })}
          />
          <Field
            id="pub-audience"
            label="À qui elle parle"
            value={draft.audience}
            placeholder="ex. Propriétaires de maison, 35 à 60 ans, Rive-Sud"
            onChange={(v) => setDraft({ audience: v })}
          />
          <Field
            id="pub-promise"
            label="Ce qu’elle promet, en une phrase"
            hint="C’est la phrase que quelqu’un doit pouvoir répéter après avoir vu la pub une fois."
            value={draft.promise}
            placeholder="ex. Tu remplis le formulaire, on te rappelle en moins d’une heure."
            onChange={(v) => setDraft({ promise: v })}
            area
          />
          <Field
            id="pub-action"
            label="Ce qu’on doit faire après l’avoir vue"
            hint="Une seule action."
            value={draft.action}
            placeholder="ex. Cliquer et remplir le formulaire"
            onChange={(v) => setDraft({ action: v })}
          />
        </div>
      );
    }

    if (i === 1) {
      return (
        <>
          <div className="ana-q">
            <span className="ana-q-label">Où la pub va vivre</span>
            <div className="ana-chips" role="group" aria-label="Format">
              {PLATFORMS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  className={`ana-chip ${draft.platform === p.id ? 'on' : ''}`}
                  aria-pressed={draft.platform === p.id}
                  onClick={() => setDraft({ platform: p.id })}
                >
                  {p.label}
                  <small> · {p.width}×{p.height}</small>
                </button>
              ))}
            </div>
            <p className="soul-hint">{platform.where}</p>
          </div>

          <div className="ana-q">
            <span className="ana-q-label">Images par seconde</span>
            <div className="ana-chips" role="group" aria-label="Images par seconde">
              {FPS_CHOICES.map((f) => (
                <button
                  type="button"
                  key={f}
                  className={`ana-chip ${draft.fps === f ? 'on' : ''}`}
                  aria-pressed={draft.fps === f}
                  onClick={() => setDraft({ fps: f })}
                >
                  {f}
                </button>
              ))}
            </div>
            <p className="soul-hint">
              30 convient à presque tout. 60 double le nombre d’images à capturer, donc le temps de rendu, pour un gain que
              personne ne remarque sur une pub.
            </p>
          </div>

          <div className="ana-task-readout">
            Rendu prévu : <b>{platform.width} × {platform.height}</b> · <b>{round1(total)} s</b> ·{' '}
            <b>{frameCount(draft)} images</b> à capturer.
          </div>
        </>
      );
    }

    if (i === 2) {
      const sorted = [...draft.scenes].sort((a, b) => a.start - b.start);
      return (
        <>
          <p className="lead" style={{ fontSize: 18 }}>
            C’est le cœur du brief. Une ligne par scène : son nom, sa seconde de début, sa seconde de fin, et ce qu’on voit.
            Décide les secondes avant de décider les images.
          </p>
          <Timeline d={draft} />
          {issues.length > 0 && (
            <div className="pub-issues">
              <div className="eyebrow">À regarder</div>
              <ul>
                {issues.map((x, k) => (
                  <li key={k} className={x.level}>
                    {x.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="pub-scenes">
            {sorted.map((s, k) => (
              <SceneRow
                key={s.id}
                s={s}
                i={k}
                onChange={(p) => updateScene(s.id, p)}
                onRemove={draft.scenes.length > 1 ? () => removeScene(s.id) : undefined}
              />
            ))}
          </div>
          <div className="ana-add">
            <Button variant="light" onClick={addScene}>
              + Ajouter une scène
            </Button>
            <p className="soul-hint">
              Une pub de quinze secondes tient en trois ou quatre scènes. Au delà de dix, tu racontes trop.
            </p>
          </div>
        </>
      );
    }

    return (
      <>
        <p className="lead" style={{ fontSize: 18 }}>
          Ces valeurs seront écrites comme fixes dans le brief. La machine n’a pas le droit de les améliorer.
        </p>
        <div className="pub-swatches">
          <Swatch id="pub-accent" label="Accent" value={draft.accent} onChange={(v) => setDraft({ accent: v })} />
          <Swatch id="pub-bg" label="Fond" value={draft.bg} onChange={(v) => setDraft({ bg: v })} />
          <Swatch id="pub-ink" label="Texte" value={draft.ink} onChange={(v) => setDraft({ ink: v })} />
        </div>
        <div className="soul-fields">
          <Field
            id="pub-font-title"
            label="Police des titres"
            value={draft.fontTitle}
            placeholder="ex. Outfit Bold"
            onChange={(v) => setDraft({ fontTitle: v })}
          />
          <Field
            id="pub-font-body"
            label="Police du texte"
            value={draft.fontBody}
            placeholder="ex. Inter Regular"
            onChange={(v) => setDraft({ fontBody: v })}
          />
          <Field
            id="pub-forbidden"
            label="Zones interdites"
            hint="Les endroits où l’interface de la plateforme recouvre ta vidéo. Sur un Reel, compte environ 250 px en haut et 400 px en bas."
            value={draft.forbidden}
            placeholder="ex. Rien d’important dans les 250 premiers pixels ni les 400 derniers."
            onChange={(v) => setDraft({ forbidden: v })}
            area
          />
          <Field
            id="pub-rules"
            label="Autres règles"
            hint="Ce que la machine doit savoir et qu’elle ne devinera pas. Facultatif."
            value={draft.rules}
            placeholder="ex. Le logo n’apparaît qu’à la dernière scène. Jamais de texte en majuscules."
            onChange={(v) => setDraft({ rules: v })}
            area
          />
        </div>
      </>
    );
  };

  const blocked = i === STEPS.length - 1 && !isUsable(draft);

  return shell(
    <div className="card ana-card">
      <div className="ana-fn-head">
        <div>
          <div className="eyebrow">
            Étape {i + 1} sur {STEPS.length}
          </div>
          <h2 className="display section-title ana-fn-title">{STEPS[i]}</h2>
        </div>
        {stepper(i)}
      </div>

      <div className="soul-progress">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${((i + 1) / STEPS.length) * 100}%` }} />
        </div>
        <span className="soul-stepline">
          {STEPS[i]} · {round1(total)} s au total
        </span>
      </div>

      {body()}

      {blocked && (
        <p className="ana-hint">
          Il manque le nom de ta marque, ou une scène n’a pas de nom, ou deux scènes se chevauchent. Corrige, et le brief
          se génère.
        </p>
      )}

      <div className="soul-nav">
        <Button variant="light" onClick={prev}>
          ← {i === 0 ? 'Retour au guide' : STEPS[i - 1]}
        </Button>
        <Button onClick={next} disabled={blocked}>
          {i === STEPS.length - 1 ? 'Générer mon brief →' : `${STEPS[i + 1]} →`}
        </Button>
      </div>
    </div>,
  );
}
