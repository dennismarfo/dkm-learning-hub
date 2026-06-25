import { useState } from 'react';
import { Demo } from './Demo';

// Simplified tokenizer: words, apostrophes, digits and punctuation as tokens
// (same regex as the source demo).
const tokenize = (txt: string): string[] => txt.match(/[A-Za-zÀ-ÿ]+|'|\d+|[^\sA-Za-zÀ-ÿ\d]/g) || [];

export function Tokenizer({ title, intro }: { title: string; intro: string }) {
  const [text, setText] = useState("L'intelligence artificielle apprend vite.");
  const tokens = tokenize(text);
  return (
    <Demo title={title} intro={intro}>
      <input
        className="demo-input"
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="Texte à découper en tokens"
      />
      <div className="tok-out">
        {tokens.map((t, i) => (
          <span className="tok" key={i}>{t}</span>
        ))}
      </div>
      <div className="readout">
        <div className="stat"><div className="k">Tokens</div><div className="v">{tokens.length}</div></div>
      </div>
    </Demo>
  );
}
