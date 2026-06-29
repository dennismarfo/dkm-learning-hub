import { go } from '../nav';
import { Pill } from './Pill';
import type { Module } from '../course-data';

// ModuleLink (molecule): a row linking to a course module.
export function ModuleLink({ m }: { m: Module }) {
  return (
    <button className="module reset" onClick={() => go(`/courses/architecture-ia/${m.id}`)}>
      <span className="num">{String(m.number).padStart(2, '0')}</span>
      <span>
        <strong>{m.title}</strong>
        <small>
          {m.tome} · {m.eyebrow} · {m.minutes} min
        </small>
      </span>
      <Pill>ouvrir</Pill>
    </button>
  );
}
