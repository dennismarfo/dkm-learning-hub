import { useEffect, useRef, useState } from 'react';
import { Demo } from './Demo';

const INK = '#2A1A12';
const TERRA = '#C8553D';
const LAYERS = [3, 5, 4, 2];
const W = 520, H = 240, PAD = 40;
const colX = LAYERS.map((_, i) => PAD + i * ((W - 2 * PAD) / (LAYERS.length - 1)));
const nodes = LAYERS.map((count, li) =>
  Array.from({ length: count }, (_, n) => ({ x: colX[li], y: H / 2 + (n - (count - 1) / 2) * 44 })),
);

export function NetworkSignal({ title, intro }: { title: string; intro: string }) {
  const [active, setActive] = useState(-1); // currently firing layer
  const [running, setRunning] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const fire = () => {
    if (running) return;
    setRunning(true);
    timers.current.forEach(clearTimeout);
    timers.current = [];
    LAYERS.forEach((_, li) => {
      timers.current.push(window.setTimeout(() => setActive(li), li * 450));
    });
    timers.current.push(
      window.setTimeout(() => {
        setActive(-1);
        setRunning(false);
      }, LAYERS.length * 450 + 300),
    );
  };

  return (
    <Demo title={title} intro={intro}>
      <svg viewBox={`0 0 ${W} ${H}`} className="demo-svg demo-svg-wide">
        {nodes.slice(0, -1).flatMap((arr, li) =>
          arr.flatMap((a, ai) =>
            nodes[li + 1].map((b, bi) => (
              <line
                key={`${li}-${ai}-${bi}`}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={active === li ? TERRA : '#e4d6bf'}
                strokeWidth={active === li ? 2 : 1.2}
              />
            )),
          ),
        )}
        {nodes.flatMap((arr, li) =>
          arr.map((p, pi) => {
            const base = li === 0 ? INK : li === LAYERS.length - 1 ? '#8a5a20' : '#b59a6e';
            return (
              <circle
                key={`${li}-${pi}`}
                cx={p.x} cy={p.y} r={10}
                fill={active === li ? TERRA : '#fffdf4'}
                stroke={base} strokeWidth={2.5}
              />
            );
          }),
        )}
      </svg>
      <div className="demo-actions">
        <button className="demo-btn" onClick={fire} disabled={running}>
          {running ? 'Propagation…' : '⚡ Propager le signal'}
        </button>
        <span className="demo-muted">Entrée → couches cachées → sortie, couche par couche.</span>
      </div>
    </Demo>
  );
}
