import { useEffect, useRef, useState, type ReactNode } from 'react';

// Staged reveal shared by the pipeline-style demos (RagPipeline, ToolUse):
// `lit` is how many stages are visible; `reveal()` hides all then re-reveals
// them one by one. Starts fully revealed so the initial selection shows at once.
export function useStagedReveal(total: number, delayMs: number) {
  const [lit, setLit] = useState(total);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const reveal = () => {
    setLit(0);
    timers.current.forEach(clearTimeout);
    timers.current = Array.from({ length: total }, (_, n) => window.setTimeout(() => setLit(n + 1), n * delayMs));
  };
  return { lit, reveal };
}

// Shared chrome for an interactive demo: the "Interactif" tag, the original
// heading and intro text, then the interactive body.
export function Demo({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="demo demo-live">
      <div className="demo-head">
        <span className="demo-tag">Interactif</span>
        <h3>{title}</h3>
      </div>
      {intro ? <p className="demo-desc">{intro}</p> : null}
      {children}
    </div>
  );
}

// A labelled range slider used across several demos.
export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="demo-slider">
      <span className="demo-slider-label">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="demo-slider-val">{value.toFixed(step < 1 ? 2 : 0)}</span>
    </label>
  );
}
