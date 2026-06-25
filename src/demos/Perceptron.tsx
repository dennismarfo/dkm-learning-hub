import { useState } from 'react';
import { Demo, Slider } from './Demo';

const INK = '#2A1A12';
const TERRA = '#C8553D';

type Act = 'relu' | 'sig';
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

// Pure forward pass — kept separate so the math reads clearly.
function forward(x: number[], w: number[], b: number, act: Act) {
  const z = x[0] * w[0] + x[1] * w[1] + x[2] * w[2] + b;
  const out = act === 'relu' ? Math.max(0, z) : sigmoid(z);
  const strength = act === 'relu' ? Math.min(out / 2, 1) : out;
  const firing = (act === 'relu' && out > 1) || (act === 'sig' && out > 0.7);
  return { z, out, strength, firing };
}

export function Perceptron({ title, intro }: { title: string; intro: string }) {
  const [x, setX] = useState([0.8, 0.5, 0.3]);
  const [w, setW] = useState([0.7, -0.4, 0.6]);
  const [b, setB] = useState(0);
  const [act, setAct] = useState<Act>('relu');
  const { z, out, strength, firing } = forward(x, w, b, act);
  const setXi = (i: number, v: number) => setX((a) => a.map((p, j) => (j === i ? v : p)));
  const setWi = (i: number, v: number) => setW((a) => a.map((p, j) => (j === i ? v : p)));
  const inY = [50, 100, 150];

  return (
    <Demo title={title} intro={intro}>
      <div className="demo-row">
        <div className="demo-col">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <Slider label={<>Entrée <b>x{i + 1}</b></>} value={x[i]} min={0} max={1} step={0.05} onChange={(v) => setXi(i, v)} />
              <Slider label={<>Poids <b>w{i + 1}</b></>} value={w[i]} min={-1} max={1} step={0.05} onChange={(v) => setWi(i, v)} />
            </div>
          ))}
          <Slider label={<>Biais <b>b</b></>} value={b} min={-1} max={1} step={0.05} onChange={setB} />
          <div className="seg">
            <button className={act === 'relu' ? 'on' : ''} onClick={() => setAct('relu')}>ReLU</button>
            <button className={act === 'sig' ? 'on' : ''} onClick={() => setAct('sig')}>Sigmoïde</button>
          </div>
        </div>
        <div className="demo-col demo-col-center">
          <svg viewBox="0 0 240 200" width="240" height="200" className="demo-svg">
            {[0, 1, 2].map((i) => {
              const contrib = Math.min(Math.abs(x[i] * w[i]), 1);
              return (
                <line
                  key={i}
                  x1={20}
                  y1={inY[i]}
                  x2={120}
                  y2={100}
                  stroke={x[i] * w[i] >= 0 ? INK : TERRA}
                  strokeWidth={1.5 + contrib * 4}
                  opacity={0.35 + contrib * 0.65}
                />
              );
            })}
            <line x1={120} y1={100} x2={215} y2={100} stroke={strength > 0.4 ? TERRA : '#cdbfae'} strokeWidth={2 + strength * 5} />
            {inY.map((y) => <circle key={y} cx={20} cy={y} r={9} fill={INK} />)}
            <circle cx={120} cy={100} r={30 + strength * 14} fill={strength > 0.5 ? TERRA : '#F6E1DA'} stroke={TERRA} strokeWidth={3} />
            <circle cx={215} cy={100} r={9} fill="#8a5a20" />
          </svg>
          <div className={`fire-badge ${firing ? 'fire-on' : 'fire-off'}`}>{firing ? '⚡ Le neurone s’active fort !' : 'Au repos'}</div>
        </div>
      </div>
      <div className="readout">
        <div className="stat"><div className="k">Somme pondérée (avant activation)</div><div className="v">{z.toFixed(2)}</div></div>
        <div className="stat"><div className="k">Sortie (après activation)</div><div className="v">{out.toFixed(2)}</div></div>
      </div>
    </Demo>
  );
}
