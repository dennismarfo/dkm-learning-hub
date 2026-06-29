import { Button, Nav, Pill } from './components';
import { go } from './nav';
import { projects } from './projects-data';

export default function Projects() {
  return (
    <>
      <Nav />
      <section className="band band-ink">
        <div className="wrap hero">
          <div className="eyebrow">Projets & Labs · Build in public</div>
          <h1 className="display h1">Les preuves concrètes derrière l’apprentissage.</h1>
          <p className="lead">
            Une vitrine vivante des projets DKM : produits personnels, pipelines IA, cas business et expérimentations R&D.
            Objectif : documenter ce qui est construit, ce qui est appris et ce qui peut devenir une ressource réutilisable.
          </p>
          <div className="actions">
            <Button onClick={() => go('/resources')}>Voir les ressources liées</Button>
            <Button variant="light" onClick={() => go('/courses/architecture-ia')}>Revenir au cours IA</Button>
          </div>
        </div>
      </section>
      <main className="wrap section">
        <section className="grid grid2">
          <div className="card dark">
            <div className="eyebrow">Positionnement</div>
            <h2 className="display section-title">Je n’enseigne pas juste l’IA, je construis avec l’IA.</h2>
            <p>
              Chaque projet sert de laboratoire : on part d’un problème réel, on documente les choix, puis on transforme les apprentissages en templates, guides ou formations.
            </p>
          </div>
          <div className="card">
            <div className="eyebrow">Méthode</div>
            <h2>Un format court, lisible, actionnable.</h2>
            <p>
              Les fiches restent volontairement simples : problème, objectif, stack, apprentissage, prochaine étape et ressource associée.
            </p>
          </div>
        </section>
        <section className="section">
          <div className="eyebrow">Premiers labs</div>
          <h2 className="display section-title">3 projets vitrines</h2>
          <div className="modules">
            {projects.map((project, index) => (
              <article className="card" key={project.slug}>
                <div className="eyebrow">{String(index + 1).padStart(2, '0')} · {project.category}</div>
                <h3 className="display section-title">{project.title}</h3>
                <div className="tags"><Pill>{project.status}</Pill></div>
                <div className="grid grid2">
                  <div>
                    <div className="eyebrow">Problème</div>
                    <p>{project.problem}</p>
                  </div>
                  <div>
                    <div className="eyebrow">Objectif</div>
                    <p>{project.goal}</p>
                  </div>
                  <div>
                    <div className="eyebrow">Ce que j’apprends</div>
                    <p>{project.learning}</p>
                  </div>
                  <div>
                    <div className="eyebrow">Prochaine étape</div>
                    <p>{project.nextStep}</p>
                  </div>
                </div>
                <div className="tags">
                  {project.stack.map((item) => <Pill key={item}>{item}</Pill>)}
                </div>
                <p><strong>Ressource liée :</strong> {project.resource}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="footer wrap">@dkmarfo · apprendre, documenter, construire.</footer>
    </>
  );
}
