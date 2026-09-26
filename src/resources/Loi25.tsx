import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { go } from '../nav';
import { Brand, Button } from '../components';
import { track } from '../analytics';
import {
  ANSWERS,
  DISCLAIMER,
  ITEMS,
  SANCTIONS,
  SECTIONS,
  SOURCES,
  STORAGE_KEY,
  buildReport,
  emptyCheck,
  tally,
  verdict,
  type Answer,
  type Check,
} from './loi25-data';

/* ============================================================
   Checklist Loi 25 : l'IA et les données de tes clients
   Livrable du mot-clé « LOI 25 » (Reel du 26 sept. 2026).
   checklist (10 points, Oui / Non / Je ne sais pas) → résultat
   - 100 % client : les réponses vivent dans localStorage, rien ne
     sort du navigateur. Pas de capture courriel (D-017 / D-030).
   - export .md natif (Blob), copie presse-papier, impression/PDF
   ============================================================ */

type Screen = 'check' | 'results';

/** Même règle que l'Anatomie : page autonome tant que le Hub n'est pas ouvert au public. */
const STANDALONE = true;

function load(): { check: Check; screen: Screen } {
  const fresh = { check: emptyCheck(), screen: 'check' as Screen };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh;
    const p = JSON.parse(raw) as { check?: Partial<Check> };
    if (!p.check || typeof p.check !== 'object') return fresh;
    const answers: Check['answers'] = {};
    const src = (p.check.answers ?? {}) as Record<string, unknown>;
    for (const it of ITEMS) {
      const a = src[it.id];
      if (a === 'oui' || a === 'non' || a === 'nsp') answers[it.id] = a;
    }
    return {
      check: {
        tool: typeof p.check.tool === 'string' ? p.check.tool : '',
        startedAt: typeof p.check.startedAt === 'string' ? p.check.startedAt : fresh.check.startedAt,
        answers,
      },
      // l'URL mène toujours à la checklist, réponses conservées
      screen: 'check',
    };
  } catch {
    return fresh;
  }
}

function save(check: Check) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ check }));
  } catch {
    /* stockage indisponible : l'outil reste utilisable */
  }
}

export default function Loi25() {
  const [{ check, screen }, setState] = useState(load);
  const [copied, setCopied] = useState(false);
  const started = useRef(Object.keys(check.answers).length > 0);

  useEffect(() => save(check), [check]);

  const t = useMemo(() => tally(check), [check]);
  const md = useMemo(() => buildReport(check), [check]);

  const setScreen = (s: Screen) => {
    setState((st) => ({ ...st, screen: s }));
    window.scrollTo({ top: 0 });
  };

  const answer = (id: string, a: Answer) => {
    if (!started.current) {
      started.current = true;
      track('loi25_start');
    }
    setState((st) => ({ ...st, check: { ...st.check, answers: { ...st.check.answers, [id]: a } } }));
  };

  const showResults = () => {
    track('loi25_results', { oui: t.oui.length, non: t.non.length, nsp: t.nsp.length });
    setScreen('results');
  };

  const restart = () => {
    started.current = false;
    setState({ check: emptyCheck(), screen: 'check' });
    setCopied(false);
    window.scrollTo({ top: 0 });
  };

  const copy = async () => {
    track('loi25_copy');
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const download = () => {
    track('loi25_download');
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'checklist-loi25.md';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const shell = (children: ReactNode) => (
    <main className="wrap section soul-shell ana-shell ana-wide l25">
      <div className="ana-top">
        {STANDALONE ? (
          <span className="brand" aria-label="dkm Learning Hub">
            <span className="mark">dkm</span>
            <span className="brand-sep" aria-hidden="true" />
            <span className="brand-label">Learning Hub</span>
          </span>
        ) : (
          <>
            <Brand />
            <button className="reset soul-back" onClick={() => go('/resources')}>
              ← Retour aux ressources
            </button>
          </>
        )}
      </div>
      {children}
    </main>
  );

  if (screen === 'check') {
    const done = t.answered === t.total;
    return shell(
      <>
        <section className="hero ana-hero">
          <div className="eyebrow">Ressource · Loi 25 · gratuit</div>
          <h1 className="display h1 ana-h1">Tu mets les données de tes clients dans une IA ?</h1>
          <p className="lead">
            Dix questions pour savoir si c’est conforme à la Loi 25 au Québec. Cinq sur ton outil, cinq sur ton entreprise.
            Dix minutes, sans compte, tes réponses restent dans ton navigateur.
          </p>
          <p className="ana-note l25-disclaimer">{DISCLAIMER}</p>
        </section>

        <div className="card ana-start">
          <div className="soul-field">
            <label className="soul-label" htmlFor="l25-tool">
              Quel outil IA vérifies-tu ? <small className="l25-opt">optionnel</small>
            </label>
            <input
              id="l25-tool"
              className="soul-input"
              value={check.tool}
              placeholder="ex. ChatGPT, Claude, Gemini, ton agent vocal, ton CRM avec IA"
              onChange={(e) => {
                const tool = e.target.value;
                setState((st) => ({ ...st, check: { ...st.check, tool } }));
              }}
            />
            <p className="soul-hint">Un outil à la fois. Refais la checklist pour chaque outil qui touche des données clients.</p>
          </div>
        </div>

        {SECTIONS.map((s) => (
          <section className="card ana-card l25-section" key={s.id}>
            <div className="eyebrow">
              {s.code} · Cinq questions
            </div>
            <h2 className="display ana-fn-title">{s.title}</h2>
            <p className="ana-fn-intro">{s.intro}</p>
            <div className="ana-tasks">
              {ITEMS.filter((it) => it.section === s.id).map((it) => {
                const a = check.answers[it.id];
                const n = ITEMS.indexOf(it) + 1;
                return (
                  <div className={`ana-task l25-item ${a ? `a-${a}` : ''}`} key={it.id}>
                    <div className="ana-task-head">
                      <div className="ana-task-label">
                        <span className="num">{String(n).padStart(2, '0')}</span>
                        <span>{it.q}</span>
                      </div>
                      <div className="ana-seg l25-seg" role="radiogroup" aria-label={it.q}>
                        {ANSWERS.map((o) => (
                          <button
                            type="button"
                            key={o.id}
                            role="radio"
                            aria-checked={a === o.id}
                            className={`${a === o.id ? 'on' : ''} s-${o.id}`}
                            onClick={() => answer(it.id, o.id)}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <details className="l25-more">
                      <summary>Pourquoi · comment vérifier</summary>
                      <p>
                        <b>Pourquoi ({it.art}).</b> {it.why}
                      </p>
                      <p>
                        <b>Comment vérifier.</b> {it.how}
                      </p>
                    </details>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <div className="soul-nav">
          <span className="ana-task-readout">
            <b>{t.answered}</b>/{t.total} réponses
          </span>
          <Button onClick={showResults} disabled={t.answered === 0}>
            {done ? 'Voir mon résultat →' : 'Voir mon résultat quand même →'}
          </Button>
        </div>
        {!done && t.answered > 0 && (
          <p className="ana-hint">Les questions sans réponse comptent comme non conformes dans le résultat.</p>
        )}
      </>,
    );
  }

  // résultats
  const v = verdict(t.oui.length, t.total);
  const todo = [...t.non, ...t.nsp];
  const unanswered = ITEMS.filter((it) => !check.answers[it.id]);
  return shell(
    <>
      <section className="hero ana-hero-sm">
        <div className="eyebrow">Ton résultat{check.tool.trim() ? ` · ${check.tool.trim()}` : ''}</div>
        <h1 className="display h1 ana-h1">
          {t.oui.length}/{t.total} conformes.
        </h1>
        <p className="lead">
          <b>{v.title}</b> {v.body}
        </p>
      </section>

      {(todo.length > 0 || unanswered.length > 0) && (
        <div className="card ana-card ana-results">
          <div className="eyebrow">À régler, dans cet ordre</div>
          <h2>
            {t.non.length} à régler · {t.nsp.length} à vérifier
            {unanswered.length ? ` · ${unanswered.length} sans réponse` : ''}
          </h2>
          <div className="ana-tasks">
            {[...t.non, ...t.nsp, ...unanswered].map((it) => {
              const a = check.answers[it.id];
              const tag = a === 'non' ? 'À régler' : a === 'nsp' ? 'À vérifier' : 'Sans réponse';
              return (
                <div className={`ana-task l25-item a-${a ?? 'none'}`} key={it.id}>
                  <div className="ana-task-label">
                    <span className={`l25-tag t-${a ?? 'none'}`}>{tag}</span>
                    <span>{it.q}</span>
                  </div>
                  <div className="l25-fix">
                    <p>
                      <b>Quoi faire.</b> {it.fix}
                    </p>
                    <p>
                      <b>Pourquoi ({it.art}).</b> {it.why}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid2 l25-bottom">
        <div className="card dark">
          <div className="eyebrow">Ce que tu risques</div>
          <ul className="ana-devrais">
            {SANCTIONS.map((s) => (
              <li key={s}>{s}</li>
            ))}
            <li>Les plafonds visent les grandes entreprises, mais les obligations s’appliquent à toutes, peu importe la taille.</li>
          </ul>
        </div>
        <div className="card">
          <div className="eyebrow">Sources</div>
          <ul className="l25-sources">
            {SOURCES.map((s) => (
              <li key={s.url}>
                <a className="ana-link" href={s.url} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card ana-card ana-report">
        <div className="eyebrow">Ton rapport</div>
        <h2 className="display section-title" style={{ marginTop: 8 }}>
          Garde une trace ✦
        </h2>
        <p className="lead" style={{ fontSize: 18, marginBottom: 20 }}>
          Télécharge-le et colle-le dans Claude, ChatGPT ou Gemini avec le prompt inclus : il te fera un plan pour la semaine.
          Garde aussi une copie dans tes dossiers, c’est le début de ta preuve de conformité.
        </p>
        <div className="soul-result-actions ana-print-hide">
          <Button onClick={download}>Télécharger .md</Button>
          <Button variant="light" onClick={copy}>
            {copied ? 'Copié ✓' : 'Copier le rapport'}
          </Button>
          <Button
            variant="light"
            onClick={() => {
              track('loi25_print');
              window.print();
            }}
          >
            Imprimer / PDF
          </Button>
          <Button variant="light" onClick={() => setScreen('check')}>
            ← Modifier mes réponses
          </Button>
          {copied && <span className="soul-toast">Copié dans le presse-papier</span>}
        </div>
        <pre className="soul-md ana-md">{md}</pre>
        <p className="ana-hint ana-print-hide">
          Un autre outil à vérifier ?{' '}
          <button type="button" className="reset ana-link" onClick={restart}>
            Recommencer à zéro
          </button>
          . Tes réponses n’existent que dans ce navigateur.
        </p>
      </div>
    </>,
  );
}
