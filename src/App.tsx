import { useEffect, useState } from 'react';
import { course, getModule, getExam } from './course-data';
import { DemoSlot } from './demos/registry';
import { Brand, Button, Nav, Pill, ModuleLink, QuizBlock } from './components';
import { go } from './nav';
import SoulDocument from './resources/SoulDocument';
import Projects from './Projects';
import './styles.css';

type View = 'home' | 'courses' | 'course' | 'resources' | 'soul' | 'lesson' | 'exam' | 'projects';

function parseRoute() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'courses' && parts[1] === 'architecture-ia' && parts[2] === 'examen') return { view: 'exam' as View };
  if (parts[0] === 'courses' && parts[1] === 'architecture-ia' && parts[2]) return { view: 'lesson' as View, moduleId: parts[2] };
  if (path === '/courses/architecture-ia') return { view: 'course' as View };
  if (path === '/courses') return { view: 'courses' as View };
  if (parts[0] === 'resources' && parts[1] === 'soul-document') return { view: 'soul' as View };
  if (path === '/resources') return { view: 'resources' as View };
  if (path === '/projects') return { view: 'projects' as View };
  return { view: 'home' as View };
}

function Home() {
  return (
    <>
      <Nav />
      <main>
        <section className="band band-ink">
          <div className="wrap hero">
            <div className="eyebrow">God first · build in public · IA concrète</div>
            <h1 className="display h1">Apprends l’IA comme un builder, pas comme un spectateur.</h1>
            <p className="lead">
              DKM Learning Hub transforme les concepts IA en parcours simples, interactifs et actionnables. Premier cours
              MVP : Architecture IA, du neurone à l’agent.
            </p>
            <div className="actions">
              <Button onClick={() => go('/courses/architecture-ia')}>Commencer le cours</Button>
              <Button variant="light" onClick={() => go('/resources')}>Voir les ressources</Button>
            </div>
          </div>
        </section>
        <section className="section wrap grid grid3">
          <div className="card">
            <div className="eyebrow">01 · Comprendre</div>
            <h2>Des bases claires.</h2>
            <p>IA, ML, DL, neurones, Transformers et LLM sans jargon inutile.</p>
          </div>
          <div className="card">
            <div className="eyebrow">02 · Manipuler</div>
            <h2>Des interactions.</h2>
            <p>Démos, cartes mentales, quiz et glossaire issus des HTML source.</p>
          </div>
          <div className="card dark">
            <div className="eyebrow">03 · Construire</div>
            <h2>Vers les agents.</h2>
            <p>RAG, fine-tuning, tool use, MCP et garde-fous reliés à des cas concrets.</p>
          </div>
        </section>
        <section className="band band-ink">
          <div className="wrap section">
            <div className="eyebrow">Cours vedette</div>
            <h2 className="display section-title">{course.title}</h2>
            <p className="lead">{course.promise}</p>
            <div className="tags">
              <Pill>{course.duration}</Pill>
              <Pill>{course.level}</Pill>
              <Pill>{course.exam.length} questions d’examen</Pill>
            </div>
            <div className="actions">
              <Button onClick={() => go('/courses/architecture-ia')}>Ouvrir la fiche cours</Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="footer wrap">@dkmarfo · apprendre, documenter, construire.</footer>
    </>
  );
}

function Courses() {
  return (
    <main className="wrap section">
      <Brand />
      <div className="hero">
        <div className="eyebrow">Bibliothèque MVP</div>
        <h1 className="display h1">Un premier cours solide, pensé pour grandir.</h1>
        <p className="lead">
          La V1 garde le contenu en fichiers versionnés dans le repo. Supabase viendra plus tard pour la progression,
          les examens et les profils.
        </p>
      </div>
      <div className="card">
        <div className="eyebrow">Cours disponible</div>
        <h2 className="display section-title">{course.title}</h2>
        <p>{course.promise}</p>
        <Button onClick={() => go('/courses/architecture-ia')}>Voir le parcours</Button>
      </div>
    </main>
  );
}

function CourseDetail() {
  return (
    <main className="wrap section">
      <Brand />
      <section className="hero">
        <div className="eyebrow">Cours MVP · 4 tomes · examen final</div>
        <h1 className="display h1">{course.title}</h1>
        <p className="lead">{course.promise}</p>
        <div className="tags">
          <Pill>{course.duration}</Pill>
          <Pill>{course.level}</Pill>
          <Pill>{course.exam.length} questions d’examen</Pill>
        </div>
        <div className="actions">
          <Button onClick={() => go(`/courses/architecture-ia/${course.modules[0].id}`)}>Commencer le tome 1</Button>
          <Button variant="light" onClick={() => go('/courses/architecture-ia/examen')}>Passer l’examen</Button>
        </div>
      </section>
      <section className="grid grid2">
        <div className="card dark">
          <div className="eyebrow">Résultat attendu</div>
          <h2>Tu relies concepts, outils et décisions.</h2>
          <p>Chaque module suit le principe DKM : concept → mental model → exemple → quiz → application concrète.</p>
        </div>
        <div className="card">
          <div className="eyebrow">Glossaire</div>
          <h2>{course.glossary.length} notions clés</h2>
          <div className="gloss">
            {course.glossary.map((g) => (
              <div className="gloss-item" key={g.term}>
                <dt>
                  {g.term}
                  {g.fr ? <span className="gloss-fr"> · {g.fr}</span> : null}
                </dt>
                <dd>{g.def}</dd>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="eyebrow">Modules</div>
        <h2 className="display section-title">Le parcours</h2>
        <div className="modules">
          {course.modules.map((m) => (
            <ModuleLink key={m.id} m={m} />
          ))}
        </div>
      </section>
    </main>
  );
}

function Lesson({ moduleId }: { moduleId?: string }) {
  const module = moduleId ? getModule(moduleId) : course.modules[0];
  if (!module) return <CourseDetail />;
  const next = course.modules.find((m) => m.number === module.number + 1);
  const isLast = !next;
  return (
    <main className="wrap section sidebar-layout">
      <aside className="side card">
        <Brand label="Hub" />
        <p className="side-title">{course.title}</p>
        <div className="modules mini">
          {course.modules.map((m) => (
            <button
              key={m.id}
              className={`side-link reset ${m.id === module.id ? 'on' : ''}`}
              onClick={() => go(`/courses/architecture-ia/${m.id}`)}
            >
              <span className="num">{String(m.number).padStart(2, '0')}</span> {m.nav}
            </button>
          ))}
          <button className="side-link reset exam" onClick={() => go('/courses/architecture-ia/examen')}>
            ✦ Examen final
          </button>
        </div>
      </aside>
      <article className="lesson card">
        <div className="eyebrow">
          {module.tome} · {module.eyebrow}
        </div>
        <h1 className="display">{module.title}</h1>
        {module.body.map((b, i) =>
          b.type === 'html' ? (
            <div key={i} className="lesson-body" dangerouslySetInnerHTML={{ __html: b.html }} />
          ) : (
            <DemoSlot key={i} demoKey={b.key} title={b.title} intro={b.intro} />
          ),
        )}
        {module.quiz && <QuizBlock key={module.id} quiz={module.quiz} />}
        <div className="actions">
          <Button variant="light" onClick={() => go('/courses/architecture-ia')}>Retour au parcours</Button>
          {next && <Button onClick={() => go(`/courses/architecture-ia/${next.id}`)}>Module suivant →</Button>}
          {isLast && <Button onClick={() => go('/courses/architecture-ia/examen')}>Passer l’examen →</Button>}
        </div>
      </article>
    </main>
  );
}

function ExamFlow() {
  const questions = getExam();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);
  const q = questions[i];
  const picked = answers[q.n];
  const choose = (opt: number) => setAnswers((a) => ({ ...a, [q.n]: opt }));
  const answeredCount = Object.keys(answers).length;
  const score = questions.filter((x) => answers[x.n] === x.answer).length;

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const verdict =
      pct >= 90
        ? { t: 'Maîtrise complète 🏆', s: 'Tu tiens toute la chaîne, du neurone à l’agent encadré. Impressionnant.' }
        : pct >= 70
          ? { t: 'Réussi ✅', s: 'Les fondations sont solides. Revois les questions manquées ci-dessous pour combler les derniers trous.' }
          : pct >= 50
            ? { t: 'Presque 🟡', s: 'Une bonne base, mais quelques notions clés à reprendre. La correction détaillée va t’aider.' }
            : { t: 'À retravailler 🔁', s: 'Pas de souci — reprends les tomes concernés puis retente. La correction pointe exactement quoi réviser.' };
    return (
      <main className="wrap section">
        <Brand />
        <section className="hero">
          <div className="eyebrow">Examen final · résultat · {pct}%</div>
          <h1 className="display h1">
            {score} / {questions.length}
          </h1>
          <h2 className="display section-title">{verdict.t}</h2>
          <p className="lead">{verdict.s}</p>
          <div className="actions">
            <Button
              onClick={() => {
                setAnswers({});
                setI(0);
                setDone(false);
              }}
            >
              Recommencer
            </Button>
            <Button variant="light" onClick={() => go('/courses/architecture-ia')}>Retour au cours</Button>
          </div>
        </section>
        <section className="section">
          <div className="eyebrow">Corrections</div>
          <div className="exam-review">
            {questions.map((x) => {
              const ok = answers[x.n] === x.answer;
              return (
                <div className={`card review-item ${ok ? 'good' : 'bad'}`} key={x.n}>
                  <div className="review-head">
                    <Pill>{x.tome}</Pill>
                    <span className={`tag ${ok ? 'good' : 'bad'}`}>{ok ? '✓ juste' : '✗ raté'}</span>
                  </div>
                  <p className="review-q">
                    <strong>
                      {x.n}. {x.question}
                    </strong>
                  </p>
                  <p className="review-a">Bonne réponse : {x.options[x.answer]}</p>
                  {!ok && answers[x.n] != null && <p className="review-yours">Ta réponse : {x.options[answers[x.n]]}</p>}
                  {x.explain && <p className="review-exp">{x.explain}</p>}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="wrap section">
      <Brand />
      <section className="hero exam-hero">
        <div className="eyebrow">Examen final · {q.tome}</div>
        <div className="exam-progress">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${((i + 1) / questions.length) * 100}%` }} />
          </div>
          <span className="exam-count">
            Question {i + 1} / {questions.length} · {answeredCount} répondues
          </span>
        </div>
        <h1 className="display exam-q">{q.question}</h1>
        <div className="opts">
          {q.options.map((o, oi) => (
            <button key={oi} className={`opt reset ${picked === oi ? 'picked' : ''}`} onClick={() => choose(oi)}>
              {o}
            </button>
          ))}
        </div>
        <div className="actions">
          <Button variant="light" disabled={i === 0} onClick={() => setI(i - 1)}>← Précédent</Button>
          {i < questions.length - 1 ? (
            <Button onClick={() => setI(i + 1)}>Suivant →</Button>
          ) : (
            <Button disabled={answeredCount < questions.length} onClick={() => setDone(true)}>Voir mon résultat</Button>
          )}
        </div>
        {i === questions.length - 1 && answeredCount < questions.length && (
          <p className="exam-hint">Réponds aux {questions.length - answeredCount} question(s) restante(s) pour terminer.</p>
        )}
      </section>
    </main>
  );
}

function Resources() {
  const soon = [
    'Glossaire IA',
    'Cheat sheet RAG vs fine-tuning',
    'Checklist garde-fous agents',
    'Prompts d’apprentissage',
    'Framework concept → workflow',
  ];
  return (
    <>
      <Nav />
      <section className="band band-ink">
        <div className="wrap hero">
          <div className="eyebrow">Ressources · Outil phare</div>
          <h1 className="display h1">Génère la mémoire business de ton IA.</h1>
          <p className="lead">
            Un assistant IA n’est bon que s’il connaît ton entreprise. Le Soul Document te guide en 6 étapes pour
            produire une mémoire de référence claire, et un prompt système prêt à coller.
          </p>
          <div className="actions">
            <Button onClick={() => go('/resources/soul-document')}>Lancer le générateur</Button>
          </div>
        </div>
      </section>
      <main className="wrap section">
        <section className="grid grid2">
          <div className="card">
            <div className="eyebrow">Soul Document</div>
            <h2 className="display section-title">Ta mémoire business, en 10 minutes.</h2>
            <p>
              Identité, audience, offre, voix, règles, contexte : tu réponds, on structure. Tu repars avec un document{' '}
              <strong>.md</strong> exportable et un prompt système opérationnel. Sans compte, sans envoi de données —
              tout reste dans ton navigateur.
            </p>
            <div className="actions">
              <Button onClick={() => go('/resources/soul-document')}>Lancer le générateur</Button>
            </div>
          </div>
          <div className="card dark">
            <div className="eyebrow">Pourquoi c’est utile</div>
            <h2>De la connaissance à l’action.</h2>
            <p>
              Colle la mémoire dans ton chatbot, ton agent ou ta base de connaissance. Tes réponses IA deviennent
              alignées sur ta marque, ta cible et tes garde-fous.
            </p>
          </div>
        </section>
        <section className="section">
          <div className="eyebrow">Bientôt</div>
          <h2 className="display section-title">D’autres ressources arrivent</h2>
          <div className="grid grid3">
            {soon.map((r, i) => (
              <div className="card" key={r}>
                <div className="num">{String(i + 1).padStart(2, '0')}</div>
                <h2>{r}</h2>
                <p>À produire à partir du contenu source et des besoins communauté.</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="footer wrap">@dkmarfo · apprendre, documenter, construire.</footer>
    </>
  );
}

export default function App() {
  const [route, setRoute] = useState(parseRoute());
  useEffect(() => {
    const on = () => setRoute(parseRoute());
    window.addEventListener('popstate', on);
    return () => window.removeEventListener('popstate', on);
  }, []);
  if (route.view === 'courses') return <Courses />;
  if (route.view === 'course') return <CourseDetail />;
  if (route.view === 'resources') return <Resources />;
  if (route.view === 'projects') return <Projects />;
  if (route.view === 'soul') return <SoulDocument />;
  if (route.view === 'exam') return <ExamFlow />;
  if (route.view === 'lesson') return <Lesson moduleId={route.moduleId} />;
  return <Home />;
}
