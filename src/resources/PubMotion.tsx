import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { go } from '../nav';
import { Brand, Button } from '../components';
import {
  DURATIONS,
  EXCHANGE,
  FAILURES,
  FPS,
  GUIDE,
  HONESTY,
  NOT_NEEDED,
  PLATFORMS,
  PREREQS,
  SETTINGS,
  SETTINGS_INTRO,
  STORAGE_KEY,
  VIDEO,
  TEMPLATES,
  VOTE,
  WHAT_YOU_DO,
  buildScenes,
  checkTiming,
  duration,
  emptyDraft,
  frameCount,
  isUsable,
  missing,
  platformOf,
  round1,
  templateOf,
  type Draft,
  type PlatformId,
  type Scene,
  type TemplateId,
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

const STEPS = ['Ta pub', 'Le format', 'Ce qu’elle raconte', 'Tes couleurs'];

/** Texte injecté quand la case « garder de la place pour l'interface » est cochée. */
const SAFE_AREA =
  'Rien d’important dans les 250 premiers pixels en haut ni dans les 400 derniers en bas : l’interface de la plateforme les recouvre.';

const WEBHOOK = (import.meta.env.VITE_PUB_WEBHOOK_URL as string | undefined)?.trim() || '';
const VOTE_WEBHOOK = (import.meta.env.VITE_VOTE_WEBHOOK_URL as string | undefined)?.trim() || '';
const LEAD_KEY = 'dkm.pub-motion.lead';
const VOTE_KEY = `dkm.vote.${VOTE.topic}`;

function voteDone(): boolean {
  try {
    return window.localStorage.getItem(VOTE_KEY) === '1';
  } catch {
    return false;
  }
}

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
    const template = TEMPLATES.some((t) => t.id === pd.template) ? (pd.template as TemplateId) : base.template;
    const seconds = DURATIONS.includes(Number(pd.seconds)) ? Number(pd.seconds) : base.seconds;
    const draft: Draft = {
      ...base,
      brand: str(pd.brand, ''),
      product: str(pd.product, ''),
      audience: str(pd.audience, ''),
      promise: str(pd.promise, ''),
      action: str(pd.action, ''),
      platform,
      seconds,
      template,
      scenes: scenes.length ? scenes : buildScenes(template, seconds),
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

/**
 * Lecteur YouTube en façade : tant qu'on n'a pas cliqué, aucune requête ne part chez
 * YouTube et aucun cookie n'est posé. Au clic, on insère l'iframe en mode nocookie.
 * Zéro dépendance, et la page reste légère pour ceux qui ne regardent pas.
 */
function VideoBlock() {
  const [playing, setPlaying] = useState(false);
  if (!VIDEO.youtubeId) return null;
  // Vignette locale : rien ne part chez Google avant le clic. Sinon on retombe sur celle
  // de YouTube, servie par i.ytimg.com, et la mention sous le lecteur le dit honnêtement.
  const local = !!VIDEO.poster;
  const poster = VIDEO.poster || `https://i.ytimg.com/vi/${VIDEO.youtubeId}/maxresdefault.jpg`;

  return (
    <div className="card ana-card pub-video">
      <div className="eyebrow">La démonstration</div>
      <h2 className="display section-title" style={{ marginTop: 8 }}>
        {VIDEO.title}
      </h2>
      <p className="lead" style={{ fontSize: 18 }}>
        {VIDEO.blurb}
      </p>
      <div className="pub-player">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${VIDEO.youtubeId}?autoplay=1&rel=0`}
            title={VIDEO.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="reset pub-play"
            style={{ backgroundImage: `url(${poster})` }}
            onClick={() => {
              track('pub_video_play');
              setPlaying(true);
            }}
            aria-label={`Lire la vidéo : ${VIDEO.title}`}
          >
            <span className="pub-play-icon" aria-hidden="true">
              ▶
            </span>
            {VIDEO.duration && <span className="pub-play-time">{VIDEO.duration}</span>}
          </button>
        )}
      </div>
      {!playing && (
        <p className="ana-hint">
          {local
            ? 'Le lecteur ne se charge qu’au clic : rien n’est demandé à YouTube tant que tu ne lances pas la vidéo.'
            : 'Le lecteur YouTube ne se charge qu’au clic. Seule la vignette vient de leurs serveurs.'}
        </p>
      )}
    </div>
  );
}

function BeatRow({
  s,
  i,
  hint,
  placeholder,
  free,
  onChange,
}: {
  s: Scene;
  i: number;
  hint: string;
  placeholder: string;
  free: boolean;
  onChange: (p: Partial<Scene>) => void;
}) {
  return (
    <div className="pub-beat">
      <div className="pub-beat-head">
        <span className="pub-num">{i + 1}</span>
        {free ? (
          <input
            className="soul-input pub-beat-name"
            value={s.label}
            placeholder={`Étape ${i + 1}`}
            onChange={(e) => onChange({ label: e.target.value })}
            aria-label={`Nom de l’étape ${i + 1}`}
          />
        ) : (
          <h3>{s.label}</h3>
        )}
      </div>
      <p className="pub-beat-hint">{hint}</p>
      <textarea
        className="soul-textarea"
        rows={3}
        value={s.shows}
        placeholder={placeholder}
        onChange={(e) => onChange({ shows: e.target.value })}
        aria-label={`Ce qu’on voit, étape ${i + 1}`}
      />
    </div>
  );
}

/** Panneau « ajuster le minutage », replié par défaut. Personne n'est obligé de l'ouvrir. */
function TimingRow({ s, i, onChange }: { s: Scene; i: number; onChange: (p: Partial<Scene>) => void }) {
  const num = (v: string) => {
    const n = Number(v.replace(',', '.'));
    return Number.isFinite(n) && n >= 0 ? round1(n) : 0;
  };
  return (
    <div className="pub-timing-row">
      <span className="pub-timing-name">
        <span className="pub-num">{i + 1}</span> {s.label || `Étape ${i + 1}`}
      </span>
      <label className="pub-time">
        <span>début</span>
        <input
          type="number"
          min={0}
          step={0.5}
          value={s.start}
          onChange={(e) => onChange({ start: num(e.target.value) })}
          aria-label={`Seconde de début, étape ${i + 1}`}
        />
      </label>
      <label className="pub-time">
        <span>fin</span>
        <input
          type="number"
          min={0}
          step={0.5}
          value={s.end}
          onChange={(e) => onChange({ end: num(e.target.value) })}
          aria-label={`Seconde de fin, étape ${i + 1}`}
        />
      </label>
      <span className="pub-dur">{round1(Math.max(0, s.end - s.start))} s</span>
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
  const [voted, setVoted] = useState(voteDone);
  const [showTiming, setShowTiming] = useState(false);

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

  /** Changer de modèle ou de durée recalcule le minutage sans effacer ce qui est écrit. */
  const setTemplate = (template: TemplateId) =>
    setState((st) => ({ ...st, draft: { ...st.draft, template, scenes: buildScenes(template, st.draft.seconds, st.draft.scenes) } }));

  const setSeconds = (seconds: number) =>
    setState((st) => ({ ...st, draft: { ...st.draft, seconds, scenes: buildScenes(st.draft.template, seconds, st.draft.scenes) } }));

  const resetTiming = () => setDraft({ scenes: buildScenes(draft.template, draft.seconds, draft.scenes) });

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

  /**
   * Vote anonyme. Le compte est toujours réel : `track` l'enregistre dans Vercel Web
   * Analytics même sans webhook. Le webhook, quand il est configuré, ajoute une trace
   * durable côté n8n. Aucune donnée personnelle dans les deux cas.
   */
  const sendVote = () => {
    if (voted) return;
    setVoted(true);
    try {
      window.localStorage.setItem(VOTE_KEY, '1');
    } catch {
      /* stockage indisponible : le vote part quand même */
    }
    track('pub_vote', { topic: VOTE.topic });
    if (!VOTE_WEBHOOK) return;
    void fetch(VOTE_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'pub-motion', topic: VOTE.topic, vote: 'oui', sentAt: new Date().toISOString() }),
    }).catch(() => {
      /* jamais bloquant : le vote est déjà compté côté analytics */
    });
  };

  const voteBlock = (
    <div className="card dark pub-vote">
      <div className="eyebrow">{VOTE.eyebrow}</div>
      <h3>{VOTE.title}</h3>
      <p>{VOTE.body}</p>
      <div className="actions">
        {voted ? (
          <span className="pub-voted">{VOTE.done}</span>
        ) : (
          <Button onClick={sendVote}>{VOTE.cta}</Button>
        )}
      </div>
      <p className="ana-hint">{VOTE.note}</p>
    </div>
  );

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
      <div className="pub-guide">
        <section className="hero ana-hero">
          <div className="eyebrow">Ressource · gratuite</div>
          <h1 className="display h1 ana-h1">La pub en dix minutes.</h1>
          <p className="lead">
            Pas d’agence, pas de monteur, pas de logiciel de montage. Tu décris ta pub, la machine la fabrique. Voici
            comment, ce que les dix minutes couvrent vraiment, et les deux choses à exiger pour que le résultat soit
            diffusable.
          </p>
        </section>

        <div className="card ana-card pub-plan">
          <div className="eyebrow">Concrètement, tu fais quoi ?</div>
          <h2 className="display section-title" style={{ marginTop: 8 }}>
            Trois choses, et tu as ta vidéo.
          </h2>
          <p className="lead" style={{ fontSize: 18 }}>
            {WHAT_YOU_DO.intro}
          </p>
          <ol className="pub-plan-steps">
            {WHAT_YOU_DO.steps.map((x) => (
              <li key={x.n}>
                <span className="pub-num big">{x.n}</span>
                <div>
                  <h3>{x.title}</h3>
                  <p>{x.detail}</p>
                  <span className="pub-time-tag">{x.time}</span>
                </div>
              </li>
            ))}
          </ol>
          <div className="actions">
            <Button
              onClick={() => {
                track('pub_start', { from: 'plan' });
                setScreen({ kind: 'step', i: 0 });
              }}
            >
              Commencer →
            </Button>
          </div>
        </div>

        <VideoBlock />

        <div className="card ana-card pub-honesty">
          <div className="eyebrow">D’abord, l’honnêteté</div>
          <h2 className="display section-title" style={{ marginTop: 8 }}>
            Dix minutes, oui. Mais pour l’animation.
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

        <div className="card dark ana-card">
          <div className="eyebrow">Avant que tu te sauves</div>
          <h2 className="display section-title" style={{ marginTop: 8 }}>
            Tu n’as pas besoin de savoir coder.
          </h2>
          <ul className="pub-list no">
            {NOT_NEEDED.no.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <p className="lead pub-yes-line">{NOT_NEEDED.yes}</p>
          <p>{NOT_NEEDED.why}</p>
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
                {p.command && <pre className="pub-command">{p.command}</pre>}
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

        <div className="card ana-card pub-exchange">
          <div className="eyebrow">Et ensuite ?</div>
          <h2 className="display section-title" style={{ marginTop: 8 }}>
            Ce qui se passe quand tu colles ton brief.
          </h2>
          <p className="lead" style={{ fontSize: 18 }}>
            {EXCHANGE.intro}
          </p>
          <div className="pub-turns">
            {EXCHANGE.turns.map((t, k) => (
              <div key={k} className={`pub-turn ${t.who === 'Claude' ? 'them' : 'you'} ${'aside' in t && t.aside ? 'aside' : ''}`}>
                <span className="pub-who">{t.who}</span>
                <div className="pub-said">
                  {t.text.split('\n\n').map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="pub-checks">
            <div className="eyebrow">{EXCHANGE.checksTitle}</div>
            <ul className="pub-list yes">
              {EXCHANGE.checks.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <p className="pub-closing">{EXCHANGE.closing}</p>
          </div>
        </div>

        <div className="card dark ana-card">
          <div className="eyebrow">Les deux exigences</div>
          <h2 className="display section-title" style={{ marginTop: 8 }}>
            Ce qui sépare le pro de l’amateur.
          </h2>
          <p className="lead" style={{ fontSize: 18 }}>
            {SETTINGS_INTRO}
          </p>
          {SETTINGS.map((x) => (
            <div className="pub-setting" key={x.code}>
              <h3>{x.demand}</h3>
              <p className="pub-symptom">{x.symptom}</p>
              <p>{x.why}</p>
              <p className="pub-code-line">
                <span>La ligne exacte, si tu veux vérifier :</span> <code className="pub-code">{x.code}</code>
              </p>
            </div>
          ))}
        </div>

        <div className="card ana-card">
          <div className="eyebrow">Le gabarit de départ</div>
          <h2 className="display section-title" style={{ marginTop: 8 }}>
            Deux fichiers, pour voir le circuit une fois.
          </h2>
          <p className="lead" style={{ fontSize: 18 }}>
            Une pub de démonstration, trois scènes, quinze secondes, et le programme qui la filme. Ouvre-la, change une
            couleur, lance le rendu. Ne cherche pas à faire ta vraie pub tout de suite : fais le tour complet une fois,
            pour que le circuit devienne familier.
          </p>
          <div className="actions">
            <a className="btn" href="/gabarit-pub/index.html" target="_blank" rel="noopener">
              Voir l’animation
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
            Mets les trois fichiers dans un même dossier vide. Le gabarit utilise les polices de ton ordinateur pour
            marcher tout de suite : c’est en mettant les tiennes que la première exigence devient indispensable.
          </p>
        </div>

        <div className="card ana-card">
          <div className="eyebrow">Ce qui rate</div>
          <h2 className="display section-title" style={{ marginTop: 8 }}>
            Les cinq erreurs que je vois le plus.
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
            Décris ta pub maintenant.
          </h2>
          <p className="lead" style={{ fontSize: 18 }}>
            Quatre écrans : ta pub, son format, tes scènes, tes couleurs. À la fin tu repars avec un brief prêt à coller
            dans Claude Code. Tout reste dans ton navigateur.
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
      </div>,
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
          Ton brief est prêt ✦
        </h2>
        <p className="lead" style={{ fontSize: 18, marginBottom: 20 }}>
          Télécharge-le, ouvre Claude Code dans un dossier vide, et colle-le. Tout est dedans, y compris la consigne de
          démarrage : tu n’as rien à ajouter. Claude commencera par te proposer le découpage en scènes, et attendra ton
          accord avant de construire.
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
            Modifier ce qu’elle raconte
          </Button>
          {copied && <span className="soul-toast">Copié dans le presse-papier</span>}
        </div>
        <pre className="soul-md ana-md">{md}</pre>

        <div className="card dark pub-next ana-print-hide">
          <div className="eyebrow">La suite</div>
          <h3>L’animation est faite. Le reste demande un système.</h3>
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

  const tpl = templateOf(draft);
  const ordered = [...draft.scenes].sort((a, b) => a.start - b.start);

  const body = () => {
    if (i === 0) {
      return (
        <div className="soul-fields">
          <Field
            id="pub-brand"
            label="Ta marque"
            hint="Le seul champ vraiment obligatoire."
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
            hint="La phrase que quelqu’un doit pouvoir répéter après avoir vu la pub une seule fois."
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
              {PLATFORMS.map((x) => (
                <button
                  type="button"
                  key={x.id}
                  className={`ana-chip ${draft.platform === x.id ? 'on' : ''}`}
                  aria-pressed={draft.platform === x.id}
                  onClick={() => setDraft({ platform: x.id })}
                >
                  {x.label}
                </button>
              ))}
            </div>
            <p className="soul-hint">{platform.where}</p>
          </div>

          <div className="ana-q">
            <span className="ana-q-label">Combien de temps elle dure</span>
            <div className="ana-chips" role="group" aria-label="Durée">
              {DURATIONS.map((x) => (
                <button
                  type="button"
                  key={x}
                  className={`ana-chip ${draft.seconds === x ? 'on' : ''}`}
                  aria-pressed={draft.seconds === x}
                  onClick={() => setSeconds(x)}
                >
                  {x} s
                </button>
              ))}
            </div>
            <p className="soul-hint">
              Quinze secondes suffisent à presque tout, et se regardent jusqu’au bout. Prends plus long seulement si tu as
              vraiment quelque chose à montrer.
            </p>
          </div>

          <div className="ana-task-readout">
            Ta pub fera <b>{platform.width} × {platform.height}</b>, <b>{round1(total)} secondes</b>, soit{' '}
            <b>{frameCount(draft)} images</b> à produire. Tu n’as rien à faire de ces chiffres : ils sont dans le brief.
          </div>
        </>
      );
    }

    if (i === 2) {
      const free = draft.template === 'libre';
      return (
        <>
          <p className="lead" style={{ fontSize: 18 }}>
            Choisis une forme, puis remplis chaque étape en une ou deux phrases. Écris ce qu’on <strong>voit</strong>,
            pas ce qu’on ressent. Les secondes, c’est Claude qui les proposera.
          </p>

          <div className="ana-q">
            <span className="ana-q-label">Quelle forme ?</span>
            <div className="pub-templates" role="group" aria-label="Forme de la pub">
              {TEMPLATES.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  className={`pub-template ${draft.template === t.id ? 'on' : ''}`}
                  aria-pressed={draft.template === t.id}
                  onClick={() => setTemplate(t.id)}
                >
                  <strong>{t.label}</strong>
                  <small>{t.tagline}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="pub-beats">
            {ordered.map((sc, k) => (
              <BeatRow
                key={sc.id}
                s={sc}
                i={k}
                free={free}
                hint={tpl.beats[k]?.hint ?? 'Dis ce qu’on voit.'}
                placeholder={tpl.beats[k]?.placeholder ?? 'Ce qu’on voit.'}
                onChange={(patch) => updateScene(sc.id, patch)}
              />
            ))}
          </div>

          <div className="pub-advanced">
            <button
              type="button"
              className="reset pub-disclose"
              aria-expanded={showTiming}
              onClick={() => setShowTiming((v) => !v)}
            >
              {showTiming ? '▾' : '▸'} Ajuster le minutage toi-même
              <small>Facultatif. Tu peux passer à la suite sans l’ouvrir.</small>
            </button>
            {showTiming && (
              <div className="pub-timing">
                <p className="ana-hint" style={{ marginTop: 0 }}>
                  Réparti automatiquement sur {round1(total)} secondes, avec au moins trois secondes pour l’appel à
                  l’action. Ces valeurs partent dans le brief comme proposition : Claude peut les discuter.
                </p>
                <Timeline d={draft} />
                {ordered.map((sc, k) => (
                  <TimingRow key={sc.id} s={sc} i={k} onChange={(patch) => updateScene(sc.id, patch)} />
                ))}
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
                <Button variant="light" onClick={resetTiming}>
                  Revenir au minutage proposé
                </Button>
              </div>
            )}
          </div>
        </>
      );
    }

    return (
      <>
        <p className="lead" style={{ fontSize: 18 }}>
          Ce sont tes couleurs et tes polices. Elles seront écrites comme fixes dans le brief : la machine n’a pas le
          droit de les « améliorer ». Si tu n’en as pas encore, mets ce que tu utilises déjà ailleurs, et garde les mêmes
          partout.
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
            hint="Le nom suffit. Si tu ne sais pas, laisse vide : Claude proposera."
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
          <label className="ana-consent pub-safe">
            <input
              type="checkbox"
              checked={!!draft.forbidden.trim()}
              onChange={(e) => setDraft({ forbidden: e.target.checked ? SAFE_AREA : '' })}
            />
            <span>
              <strong>Garder de la place pour l’interface de la plateforme.</strong> Instagram et TikTok posent des
              boutons par dessus ta vidéo, en haut et en bas. Coché, rien d’important ne sera placé dessous.
            </span>
          </label>
          <Field
            id="pub-rules"
            label="Autre chose à savoir ?"
            hint="Ce que la machine ne devinera pas. Facultatif, tu peux laisser vide."
            value={draft.rules}
            placeholder="ex. Le logo n’apparaît qu’à la dernière étape. Jamais de texte tout en majuscules."
            onChange={(v) => setDraft({ rules: v })}
            area
          />
        </div>
        {voteBlock}
      </>
    );
  };

  const gap = missing(draft);
  const blocked = i === STEPS.length - 1 && !isUsable(draft);

  return shell(
    <div className="card ana-card pub-form">
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
          {STEPS[i]} · pub de {round1(total)} s
        </span>
      </div>

      {body()}

      {blocked && gap && <p className="ana-hint">{gap}</p>}

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
