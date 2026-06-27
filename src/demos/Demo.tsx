import type { ReactNode } from 'react';

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
      <span className="demo-slider-val">{value.toFixed(2)}</span>
    </label>
  );
}
