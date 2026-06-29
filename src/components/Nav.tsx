import { go } from '../nav';
import { Brand } from './Brand';

// Nav (organism): sticky top bar with the brand and primary links.
export function Nav() {
  return (
    <header className="nav">
      <div className="wrap navin">
        <Brand to="/" />
        <nav className="links">
          <button onClick={() => go('/courses')}>Cours</button>
          <button onClick={() => go('/resources')}>Ressources</button>
          <button onClick={() => go('/projects')}>Projets</button>
          <button className="nav-extra" onClick={() => go('/courses/architecture-ia')}>Architecture IA</button>
        </nav>
      </div>
    </header>
  );
}
