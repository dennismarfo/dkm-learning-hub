import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { go } from '../nav';
import { Brand, Button } from '../components';
import {
  FREQS,
  FUNCTIONS,
  MINUTE_PRESETS,
  STORAGE_KEY,
  emptyAudit,
  hoursPerMonth,
  isComplete,
  score,
  summarize,
  tasksOf,
  type Audit,
  type FreqId,
  type Status,
  type TaskEntry,
} from './anatomie-data';
import { buildLeadSummary, buildReport } from './anatomie-report';

/* ============================================================
   L'anatomie de ton entreprise · outil interactif (module 0)
   intro → 7 fonctions → résultats → (capture courriel) → rapport
   - 100 % client : l'audit vit dans localStorage, rien ne part
     hors du navigateur sauf, si un webhook est configuré au build
     (VITE_ANATOMIE_WEBHOOK_URL), le courriel + un résumé chiffré.
   - export .md natif (Blob), copie presse-papier, impression/PDF
   ============================================================ */

type Screen = { kind: 'intro' } | { kind: 'fn'; i: number } | { kind: 'results' } | { kind: 'lead' } | { kind: 'report' };

const WEBHOOK = (import.meta.env.VITE_ANATOMIE_WEBHOOK_URL as string | undefined)?.trim() || '';
const LEAD_KEY = 'dkm.anatomie.lead';

function load(): { audit: Audit; screen: Screen } {
  const fresh = { audit: emptyAudit(), screen: { kind: 'intro' } as Screen };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh;
    const parsed = JSON.parse(raw) as { audit?: Audit; screen?: Screen };
    if (!parsed.audit || !parsed.audit.tasks) return fresh;
    // merge: keep user data, make sure every catalogue task exists
    const base = emptyAudit();
    const tasks = { ...base.tasks, ...parsed.audit.tasks };
    return { audit: { ...base, ...parsed.audit, tasks }, screen: parsed.screen ?? fresh.screen };
  } catch {
    return fresh;
  }
}

function save(audit: Audit, screen: Screen) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ audit, screen }));
  } catch {
    /* stockage indisponible : l'outil reste utilisable */
  }
}

function leadDone(): boolean {
  try {
    return window.localStorage.getItem(LEAD_KEY) === '1';
  } catch {
    return false;
  }
}

/* ---------- petits composants ---------- */

function Chips<T extends string | number>({
  value,
  options,
  onPick,
  ariaLabel,
}: {
  value: T | undefined;
  options: { v: T; l: string; title?: string }[];
  onPick: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div className="ana-chips" role="group" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={String(o.v)}
          type="button"
          className={`ana-chip reset ${value === o.v ? 'on' : ''}`}
          onClick={() => onPick(o.v)}
          title={o.title}
          aria-pressed={value === o.v}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

const PAIN = [
  { v: 1, l: '1', title: "J'aime le faire" },
  { v: 2, l: '2', title: 'Ça va' },
  { v: 3, l: '3', title: 'Neutre' },
  { v: 4, l: '4', title: 'Je traîne les pieds' },
  { v: 5, l: '5', title: 'Je repousse toujours' },
];
const REPEAT = [
  { v: 1, l: '1', title: 'Chaque fois différent' },
  { v: 2, l: '2', title: 'Souvent différent' },
  { v: 3, l: '3', title: 'Moitié-moitié' },
  { v: 4, l: '4', title: 'Presque toujours pareil' },
  { v: 5, l: '5', title: 'Toujours pareil' },
];

function TaskRow({ t, onChange, onRemove }: { t: TaskEntry; onChange: (p: Partial<TaskEntry>) => void; onRemove?: () => void }) {
  const done = isComplete(t);
  return (
    <div className={`ana-task ${t.status ? `st-${t.status}` : ''} ${done ? 'done' : ''}`}>
      <div className="ana-task-head">
        <div className="ana-task-label">
          {t.label}
          {t.custom && onRemove && (
            <button type="button" className="ana-task-remove reset" onClick={onRemove} aria-label="Retirer cette tâche">
              retirer
            </button>
          )}
        </div>
        <div className="ana-seg" role="group" aria-label={`Statut : ${t.label}`}>
          {(['FAIS', 'DEVRAIS', 'NA'] as Status[]).map((s) => (
            <button
              key={s}
              type="button"
              className={`reset ${t.status === s ? 'on' : ''} s-${s}`}
              aria-pressed={t.status === s}
              onClick={() => onChange({ status: s })}
            >
              {s === 'FAIS' ? 'Je le fais' : s === 'DEVRAIS' ? 'Je devrais' : 'Pas chez moi'}
            </button>
          ))}
        </div>
      </div>
      {t.status === 'FAIS' && (
        <div className="ana-task-detail">
          <div className="ana-q">
            <span className="ana-q-label">À quelle fréquence ?</span>
            <Chips<FreqId>
              ariaLabel="Fréquence"
              value={t.freq}
              options={FREQS.map((f) => ({ v: f.id, l: f.label }))}
              onPick={(v) => onChange({ freq: v })}
            />
          </div>
          <div className="ana-q">
            <span className="ana-q-label">Combien de minutes, à chaque fois ?</span>
            <div className="ana-minutes">
              <Chips<number>
                ariaLabel="Minutes par fois"
                value={t.minutes}
                options={MINUTE_PRESETS.map((m) => ({ v: m, l: m >= 60 ? `${m / 60} h` : `${m} min` }))}
                onPick={(v) => onChange({ minutes: v })}
              />
              <label className="ana-min-input">
                <span>ou</span>
                <input
                  type="number"
                  min={1}
                  max={600}
                  inputMode="numeric"
                  value={t.minutes && !MINUTE_PRESETS.includes(t.minutes) ? t.minutes : ''}
                  placeholder="min"
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    onChange({ minutes: Number.isFinite(n) && n > 0 ? n : undefined });
                  }}
                />
              </label>
            </div>
          </div>
          <div className="ana-q ana-q-2">
            <div>
              <span className="ana-q-label">
                Pénibilité <small>1 = j’aime · 5 = je repousse toujours</small>
              </span>
              <Chips<number> ariaLabel="Pénibilité" value={t.pain} options={PAIN} onPick={(v) => onChange({ pain: v })} />
            </div>
            <div>
              <span className="ana-q-label">
                Répétitivité <small>1 = chaque fois différent · 5 = toujours pareil</small>
              </span>
              <Chips<number> ariaLabel="Répétitivité" value={t.repeat} options={REPEAT} onPick={(v) => onChange({ repeat: v })} />
            </div>
          </div>
          {done && (
            <div className="ana-task-readout">
              ≈ <b>{hoursPerMonth(t)} h</b> par mois · score <b>{score(t)}</b>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- composant principal ---------- */

export default function Anatomie() {
  const [{ audit, screen }, setState] = useState(load);
  const [copied, setCopied] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [lead, setLead] = useState({ name: '', email: '', consent: false });
  const [leadState, setLeadState] = useState<'idle' | 'sending' | 'error'>('idle');

  useEffect(() => save(audit, screen), [audit, screen]);

  const setAudit = (patch: (a: Audit) => Audit) => setState((s) => ({ ...s, audit: patch(s.audit) }));
  const setScreen = (screen: Screen) => {
    setState((s) => ({ ...s, screen }));
    window.scrollTo({ top: 0 });
  };
  const updateTask = (id: string, p: Partial<TaskEntry>) =>
    setAudit((a) => ({ ...a, tasks: { ...a.tasks, [id]: { ...a.tasks[id], ...p } } }));

  const summary = useMemo(() => summarize(audit), [audit]);
  const md = useMemo(() => buildReport(audit), [audit]);

  const restart = () => {
    setState({ audit: emptyAudit(), screen: { kind: 'intro' } });
    setCopied(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const download = () => {
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const slug = (audit.business.trim() || 'mon-entreprise')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    a.download = `anatomie-${slug || 'mon-entreprise'}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const goToReport = () => {
    if (WEBHOOK && !leadDone()) setScreen({ kind: 'lead' });
    else setScreen({ kind: 'report' });
  };

  const sendLead = async () => {
    if (!lead.email.trim() || !lead.consent) return;
    setLeadState('sending');
    try {
      const res = await fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'anatomie',
          name: lead.name.trim() || null,
          email: lead.email.trim(),
          consent: true,
          summary: buildLeadSummary(audit),
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
      setScreen({ kind: 'report' });
    } catch {
      setLeadState('error');
    }
  };

  /* ----- écrans ----- */

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

  if (screen.kind === 'intro') {
    const hasProgress = summary.answered > 0;
    return shell(
      <>
        <section className="hero ana-hero">
          <div className="eyebrow">Ressource · Module 0 · gratuit</div>
          <h1 className="display h1 ana-h1">L’anatomie de ton entreprise.</h1>
          <p className="lead">
            Tu es seul, mais ton entreprise a sept départements. Cet outil te les fait voir, retrouve ce que tu fais vraiment,
            et te dit par où commencer avec l’IA. Trente minutes, sans compte, tout reste dans ton navigateur.
          </p>
        </section>

        <div className="grid grid3 ana-intro-grid">
          <div className="card">
            <div className="eyebrow">01 · Les 7 fonctions</div>
            <h2>Tu les occupes toutes.</h2>
            <p>
              Acquisition, vente, livraison, service client, administration et finance, opérations et outils, direction. La
              plupart des solos n’en voient que deux. Les cinq autres, ils les font le soir, en retard, ou pas du tout.
            </p>
          </div>
          <div className="card">
            <div className="eyebrow">02 · La méthode</div>
            <h2>Ne te fie pas à ta mémoire.</h2>
            <p>
              Avant de commencer, ouvre tes deux dernières semaines : ton agenda, tes courriels envoyés, tes messages. Ce sont
              tes trois sources de vérité. Tout ce que tu y trouves a sa place dans une des sept fonctions.
            </p>
          </div>
          <div className="card dark">
            <div className="eyebrow">03 · Le résultat</div>
            <h2>Une carte et un point de départ.</h2>
            <p>
              Où part ton temps, ce qui te pèse, ce que tu devrais faire et ne fais pas, et le processus par lequel commencer.
              Un rapport à télécharger, conçu pour être collé dans une IA.
            </p>
          </div>
        </div>

        <div className="card ana-start">
          <div className="eyebrow">Avant de commencer · optionnel</div>
          <div className="soul-fields">
            <div className="soul-field">
              <label className="soul-label" htmlFor="ana-business">Nom de ton entreprise ou projet</label>
              <input
                id="ana-business"
                className="soul-input"
                value={audit.business}
                placeholder="ex. Studio Léa, Plomberie Tremblay, mon activité de consultante"
                onChange={(e) => setAudit((a) => ({ ...a, business: e.target.value }))}
              />
            </div>
            <div className="soul-field">
              <label className="soul-label" htmlFor="ana-activity">Ce que tu fais, en une phrase</label>
              <input
                id="ana-activity"
                className="soul-input"
                value={audit.activity}
                placeholder="ex. Je fais la comptabilité de petites entreprises de la Rive-Sud"
                onChange={(e) => setAudit((a) => ({ ...a, activity: e.target.value }))}
              />
              <p className="soul-hint">Ces deux lignes rendent ton rapport directement utilisable par une IA.</p>
            </div>
          </div>
          <div className="soul-nav">
            <span className="ana-note">
              Pour chaque tâche tu choisis : <b>je le fais</b>, <b>je devrais</b> (mais je ne le fais pas, ou pas assez), ou{' '}
              <b>pas chez moi</b>. Pour celles que tu fais, quatre clics de plus.
            </span>
            <div className="actions" style={{ marginTop: 0 }}>
              {hasProgress && (
                <Button variant="light" onClick={restart}>
                  Repartir de zéro
                </Button>
              )}
              <Button onClick={() => setScreen({ kind: 'fn', i: 0 })}>
                {hasProgress ? `Reprendre (${summary.answered}/${summary.total} tâches)` : 'Commencer l’audit'} →
              </Button>
            </div>
          </div>
        </div>
      </>,
      true,
    );
  }

  if (screen.kind === 'fn') {
    const fn = FUNCTIONS[screen.i];
    const ts = tasksOf(audit, fn.id);
    const answered = ts.filter((t) => !!t.status).length;
    const isLast = screen.i === FUNCTIONS.length - 1;
    const addCustom = () => {
      const label = newTask.trim();
      if (!label) return;
      const n = ts.filter((t) => t.custom).length + 1;
      const id = `${fn.id}:c${Date.now().toString(36)}${n}`;
      setAudit((a) => ({ ...a, tasks: { ...a.tasks, [id]: { id, fn: fn.id, label, custom: true, status: 'FAIS' } } }));
      setNewTask('');
    };
    const removeCustom = (id: string) =>
      setAudit((a) => {
        const tasks = { ...a.tasks };
        delete tasks[id];
        return { ...a, tasks, priorityId: a.priorityId === id ? undefined : a.priorityId };
      });

    return shell(
      <div className="card ana-card">
        <div className="ana-fn-head">
          <div>
            <div className="eyebrow">
              Fonction {fn.n} / {FUNCTIONS.length}
            </div>
            <h2 className="display section-title ana-fn-title">
              {fn.name}
              <span className="ana-fn-tag"> · {fn.tagline}</span>
            </h2>
            <p className="lead ana-fn-intro">{fn.intro}</p>
          </div>
          <ol className="ana-steps" aria-label="Progression">
            {FUNCTIONS.map((f, i) => {
              const done = tasksOf(audit, f.id).every((t) => !!t.status);
              return (
                <li key={f.id}>
                  <button
                    type="button"
                    className={`reset ana-step ${i === screen.i ? 'on' : ''} ${done ? 'done' : ''}`}
                    onClick={() => setScreen({ kind: 'fn', i })}
                    title={f.name}
                    aria-label={`Aller à la fonction ${f.n} : ${f.name}`}
                  >
                    {f.n}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="soul-progress">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${(answered / ts.length) * 100}%` }} />
          </div>
          <span className="soul-stepline">
            {answered} / {ts.length} tâches
          </span>
        </div>

        <div className="ana-tasks">
          {ts.map((t) => (
            <TaskRow
              key={t.id}
              t={t}
              onChange={(p) => updateTask(t.id, p)}
              onRemove={t.custom ? () => removeCustom(t.id) : undefined}
            />
          ))}
        </div>

        <div className="ana-add">
          <label className="soul-label" htmlFor={`ana-new-${fn.id}`}>
            Une tâche de cette fonction qui n’est pas dans la liste ?
          </label>
          <div className="ana-add-row">
            <input
              id={`ana-new-${fn.id}`}
              className="soul-input"
              value={newTask}
              placeholder="ex. Préparer les soumissions pour les appels d’offres"
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustom();
                }
              }}
            />
            <Button variant="light" onClick={addCustom} disabled={!newTask.trim()}>
              Ajouter
            </Button>
          </div>
        </div>

        <div className="soul-nav">
          <Button variant="light" onClick={() => (screen.i === 0 ? setScreen({ kind: 'intro' }) : setScreen({ kind: 'fn', i: screen.i - 1 }))}>
            ← {screen.i === 0 ? 'Intro' : FUNCTIONS[screen.i - 1].name}
          </Button>
          {isLast ? (
            <Button onClick={() => setScreen({ kind: 'results' })}>Voir mes résultats →</Button>
          ) : (
            <Button onClick={() => setScreen({ kind: 'fn', i: screen.i + 1 })}>{FUNCTIONS[screen.i + 1].name} →</Button>
          )}
        </div>
        {answered < ts.length && (
          <p className="ana-hint">
            Tu peux passer à la suite et revenir plus tard : ton avancement est gardé dans ce navigateur.
          </p>
        )}
      </div>,
      true,
    );
  }

  if (screen.kind === 'results') {
    const maxH = Math.max(1, ...summary.hoursByFn.map((x) => x.hours));
    const candidates = summary.top;
    const incompleteFais = summary.fais.filter((t) => !isComplete(t)).length;
    const unanswered = summary.total - summary.answered;
    return shell(
      <>
        <section className="hero ana-hero-sm">
          <div className="eyebrow">Résultats · {audit.business.trim() || 'mon entreprise'}</div>
          <h1 className="display h1 ana-h1">
            ≈ {summary.totalHours} h par mois
          </h1>
          <p className="lead">
            C’est le temps que tes tâches récurrentes te prennent, d’après ce que tu as indiqué. Voici où il part, ce qui te
            pèse le plus, et par où commencer.
          </p>
          {(unanswered > 0 || incompleteFais > 0) && (
            <p className="ana-hint">
              {unanswered > 0 && `${unanswered} tâche(s) sans réponse. `}
              {incompleteFais > 0 && `${incompleteFais} tâche(s) « je le fais » sans fréquence, minutes ou notes. `}
              Tu peux revenir compléter, ou continuer avec ce que tu as.
            </p>
          )}
        </section>

        <div className="grid grid2 ana-results">
          <div className="card">
            <div className="eyebrow">Où part ton temps</div>
            <h2>Heures par mois, par fonction</h2>
            <div className="ana-bars">
              {summary.hoursByFn.map((x) => (
                <button type="button" key={x.fn.id} className="ana-bar reset" onClick={() => setScreen({ kind: 'fn', i: x.fn.n - 1 })} title="Modifier">
                  <span className="ana-bar-label">
                    <span className="num">{x.fn.n}</span> {x.fn.name}
                  </span>
                  <span className="ana-bar-track">
                    <i style={{ width: `${(x.hours / maxH) * 100}%` }} />
                  </span>
                  <span className="ana-bar-val">
                    {x.hours} h{x.devrais > 0 && <small> · {x.devrais} à faire</small>}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="card dark">
            <div className="eyebrow">Ce que tu devrais faire</div>
            <h2>
              {summary.devrais.length} tâche{summary.devrais.length > 1 ? 's' : ''} en attente
            </h2>
            <p>
              Souvent l’endroit où l’IA apporte le plus : elle permet de faire ce que tu n’avais pas le temps de faire. Ces
              tâches sont listées dans ton rapport, fonction par fonction.
            </p>
            {summary.devrais.length > 0 && (
              <ul className="ana-devrais">
                {summary.devrais.slice(0, 6).map((t) => (
                  <li key={t.id}>{t.label}</li>
                ))}
                {summary.devrais.length > 6 && <li>… et {summary.devrais.length - 6} autres dans le rapport</li>}
              </ul>
            )}
          </div>
        </div>

        <div className="card ana-card">
          <div className="eyebrow">Par où commencer</div>
          <h2 className="display section-title" style={{ marginTop: 8 }}>
            Choisis ton processus prioritaire.
          </h2>
          <p className="lead" style={{ fontSize: 18 }}>
            Score = heures par mois × pénibilité × répétitivité. Les tâches en haut sont celles qui, une fois allégées ou
            automatisées, te rendent le plus de temps et d’énergie. Choisis-en une.
          </p>
          {candidates.length === 0 ? (
            <p className="ana-hint">
              Aucune tâche « je le fais » n’est complète (fréquence, minutes, pénibilité, répétitivité). Reviens en compléter
              au moins une pour obtenir un classement.
            </p>
          ) : (
            <div className="ana-cands">
              {candidates.map((t, i) => {
                const fn = FUNCTIONS.find((f) => f.id === t.fn)!;
                const on = audit.priorityId === t.id;
                return (
                  <button
                    type="button"
                    key={t.id}
                    className={`ana-cand reset ${on ? 'on' : ''}`}
                    onClick={() => setAudit((a) => ({ ...a, priorityId: t.id }))}
                    aria-pressed={on}
                  >
                    <span className="ana-cand-rank">{i + 1}</span>
                    <span className="ana-cand-main">
                      <strong>{t.label}</strong>
                      <small>
                        {fn.name} · {hoursPerMonth(t)} h/mois · pénibilité {t.pain}/5 · répétitivité {t.repeat}/5
                      </small>
                    </span>
                    <span className="ana-cand-score">
                      <b>{score(t)}</b>
                      <small>score</small>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <div className="soul-nav">
            <Button variant="light" onClick={() => setScreen({ kind: 'fn', i: FUNCTIONS.length - 1 })}>
              ← Modifier mes réponses
            </Button>
            <Button onClick={goToReport} disabled={candidates.length > 0 && !audit.priorityId}>
              Générer mon rapport →
            </Button>
          </div>
          {candidates.length > 0 && !audit.priorityId && <p className="ana-hint">Choisis un processus prioritaire pour générer le rapport.</p>}
        </div>
      </>,
      true,
    );
  }

  if (screen.kind === 'lead') {
    const ok = /.+@.+\..+/.test(lead.email.trim()) && lead.consent;
    return shell(
      <div className="card ana-card">
        <div className="eyebrow">Une dernière chose</div>
        <h2 className="display section-title" style={{ marginTop: 8 }}>
          Où t’envoyer la suite ?
        </h2>
        <p className="lead" style={{ fontSize: 18 }}>
          Ton rapport est prêt. Laisse ton courriel pour le recevoir aussi par écrit, et pour être prévenu quand le module
          suivant sort. Pas de spam, tu te désabonnes en un clic.
        </p>
        <div className="soul-fields">
          <div className="soul-field">
            <label className="soul-label" htmlFor="lead-name">Prénom</label>
            <input id="lead-name" className="soul-input" value={lead.name} placeholder="ex. Léa" onChange={(e) => setLead({ ...lead, name: e.target.value })} />
          </div>
          <div className="soul-field">
            <label className="soul-label" htmlFor="lead-email">Courriel</label>
            <input
              id="lead-email"
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
              J’accepte de recevoir le rapport et les nouvelles du DKM Learning Hub par courriel. Seuls mon courriel, mon prénom
              et un résumé chiffré de l’audit (heures, top 3) sont envoyés ; la carte détaillée reste dans mon navigateur.
            </span>
          </label>
        </div>
        {leadState === 'error' && (
          <p className="ana-hint">L’envoi n’a pas fonctionné. Réessaie, ou passe directement au rapport : il est déjà prêt.</p>
        )}
        <div className="soul-nav">
          <Button variant="light" onClick={() => setScreen({ kind: 'report' })}>
            Passer, voir le rapport
          </Button>
          <Button onClick={sendLead} disabled={!ok || leadState === 'sending'}>
            {leadState === 'sending' ? 'Envoi…' : 'Recevoir et voir mon rapport →'}
          </Button>
        </div>
      </div>,
    );
  }

  // report
  return shell(
    <div className="card ana-card ana-report">
      <div className="eyebrow">Ton rapport</div>
      <h2 className="display section-title" style={{ marginTop: 8 }}>
        La carte de ton entreprise ✦
      </h2>
      <p className="lead" style={{ fontSize: 18, marginBottom: 20 }}>
        Télécharge-le, puis colle-le dans Claude, ChatGPT ou Gemini avec le prompt de démarrage inclus en tête. Prochaine
        étape naturelle : le Soul Document, la mémoire de ton entreprise.
      </p>
      <div className="soul-result-actions ana-print-hide">
        <Button onClick={download}>Télécharger .md</Button>
        <Button variant="light" onClick={copy}>
          {copied ? 'Copié ✓' : 'Copier le rapport'}
        </Button>
        <Button variant="light" onClick={() => window.print()}>
          Imprimer / PDF
        </Button>
        <Button variant="light" onClick={() => setScreen({ kind: 'results' })}>
          Retour aux résultats
        </Button>
        <Button variant="light" onClick={() => go('/resources/soul-document')}>
          Continuer avec le Soul Document →
        </Button>
        {copied && <span className="soul-toast">Copié dans le presse-papier</span>}
      </div>
      <pre className="soul-md ana-md">{md}</pre>
      <p className="ana-hint ana-print-hide">
        Tu veux repartir de zéro ?{' '}
        <button type="button" className="reset ana-link" onClick={restart}>
          Effacer cet audit
        </button>
        . Il n’existe que dans ce navigateur.
      </p>
    </div>,
    true,
  );
}
