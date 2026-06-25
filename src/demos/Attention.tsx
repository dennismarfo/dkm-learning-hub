import { useState } from 'react';
import { Demo } from './Demo';

// Sentence + illustrative attention matrix, verbatim from the source demo.
const WORDS = ['Le', 'chat', 'noir', 'dort', 'car', 'il', 'est', 'fatigué'];
const MATRIX: Record<number, number[]> = {
  0: [0, 0.3, 0.1, 0.1, 0, 0.1, 0.1, 0.1],
  1: [0.2, 0, 0.5, 0.4, 0.1, 0.6, 0.2, 0.3],
  2: [0.1, 0.7, 0, 0.2, 0, 0.3, 0.1, 0.2],
  3: [0.1, 0.6, 0.2, 0, 0.2, 0.2, 0.3, 0.4],
  4: [0, 0.2, 0.1, 0.4, 0, 0.3, 0.2, 0.4],
  5: [0.1, 0.8, 0.3, 0.3, 0.1, 0, 0.4, 0.5],
  6: [0, 0.3, 0.2, 0.3, 0.2, 0.4, 0, 0.6],
  7: [0, 0.4, 0.3, 0.4, 0.2, 0.5, 0.4, 0],
};

export function Attention({ title, intro }: { title: string; intro: string }) {
  const [focus, setFocus] = useState(5); // source defaults to focusWord(5)
  const row = MATRIX[focus];
  return (
    <Demo title={title} intro={intro}>
      <div className="att-sentence">
        {WORDS.map((wd, j) => {
          const a = row[j];
          const isFocus = j === focus;
          const style = isFocus
            ? undefined
            : {
                background: `rgba(200,85,61,${a * 0.85})`,
                borderColor: a > 0.3 ? '#C8553D' : 'var(--rule)',
                color: a > 0.5 ? '#fff' : undefined,
              };
          return (
            <button
              key={j}
              className={`att-word reset ${isFocus ? 'focus' : ''}`}
              style={style}
              onClick={() => setFocus(j)}
            >
              {wd}
            </button>
          );
        })}
      </div>
      <p className="demo-muted">
        Clique un mot : l’intensité du fond montre <b>combien chaque autre mot compte</b> pour lui.
        « {WORDS[focus]} » regarde surtout les mots les plus foncés.
      </p>
    </Demo>
  );
}
