import { go } from '../nav';

// Brand wordmark (atom): "dkm" serif signature + a quiet mono label,
// separated by a hairline. Clicking it returns home (or `to`).
export function Brand({ to = '/', label = 'Learning Hub' }: { to?: string; label?: string }) {
  return (
    <button className="brand reset" onClick={() => go(to)} aria-label={`dkm ${label} — accueil`}>
      <span className="mark">dkm</span>
      <span className="brand-sep" aria-hidden="true" />
      <span className="brand-label">{label}</span>
    </button>
  );
}
