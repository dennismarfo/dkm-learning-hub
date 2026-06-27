import { useEffect, useRef, useState } from 'react';
import { Demo, Slider } from './Demo';

const GW = 460, GH = 220, MINX = -4.5, MAXX = 4.5, START = -3.4;
const loss = (x: number) => x * x;
const grad = (x: number) => 2 * x;
const x2px = (x: number) => 30 + ((x - MINX) / (MAXX - MINX)) * (GW - 60);
const y2px = (y: number) => GH - 25 - (y / 22) * (GH - 45);
const clamp = (x: number) => Math.max(MINX, Math.min(MAXX, x));

const CURVE = (() => {
  let d = 'M';
  for (let px = 30; px <= GW - 30; px += 4) {
    const x = MINX + ((px - 30) / (GW - 60)) * (MAXX - MINX);
    d += ` ${px} ${y2px(loss(x)).toFixed(1)}`;
  }
  return d;
})();

export function GradientDescent({ title, intro }: { title: string; intro: string }) {
  const [x, setX] = useState(START);
  const [steps, setSteps] = useState(0);
  const [lr, setLr] = useState(0.18);
  const lrRef = useRef(lr);
  lrRef.current = lr;
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const step = () => {
    setX((cx) => clamp(cx - lrRef.current * grad(cx)));
    setSteps((s) => s + 1);
  };
  const run = () => {
    if (timer.current) clearInterval(timer.current);
    let i = 0;
    timer.current = window.setInterval(() => {
      step();
      if (++i >= 12 && timer.current) clearInterval(timer.current);
    }, 160);
  };
  const reset = () => {
    if (timer.current) clearInterval(timer.current);
    setX(START);
    setSteps(0);
  };

  return (
    <Demo title={title} intro={intro}>
      <svg viewBox={`0 0 ${GW} ${GH}`} className="demo-svg demo-svg-wide">
        <path d={CURVE} fill="none" stroke="#2A1A12" strokeWidth={2.5} />
        <line x1={30} y1={GH - 25} x2={GW - 30} y2={GH - 25} stroke="#e4d6bf" strokeWidth={1} />
        <circle cx={x2px(x)} cy={y2px(loss(x))} r={9} fill="#C8553D" stroke="#fffdf4" strokeWidth={2} />
        <text x={GW / 2} y={GH - 5} textAnchor="middle" className="demo-svg-axis" fill="#9a8048">valeur d’un poids →</text>
      </svg>
      <Slider label="Taux d’apprentissage" value={lr} min={0.02} max={1.05} step={0.01} onChange={setLr} />
      <div className="demo-actions">
        <button className="demo-btn" onClick={step}>Un pas ↓</button>
        <button className="demo-btn ghost" onClick={run}>Lancer 12 pas</button>
        <button className="demo-btn ghost" onClick={reset}>Réinitialiser</button>
      </div>
      <div className="readout">
        <div className="stat"><div className="k">Erreur actuelle (perte)</div><div className="v">{loss(x).toFixed(2)}</div></div>
        <div className="stat"><div className="k">Pas effectués</div><div className="v">{steps}</div></div>
      </div>
    </Demo>
  );
}
