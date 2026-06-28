import { useState } from 'react';
import { Button } from './Button';
import type { Quiz } from '../course-data';

// QuizBlock (molecule): single-question mini quiz with feedback + retry.
export function QuizBlock({ quiz }: { quiz: Quiz }) {
  const [picked, setPicked] = useState<number | null>(null);
  const done = picked !== null;
  const right = picked === quiz.answer;
  return (
    <section className="section">
      <div className="card quiz-card">
        <div className="eyebrow">Mini-quiz</div>
        <h2 className="quiz-q">{quiz.question}</h2>
        <div className="opts">
          {quiz.options.map((o, i) => {
            const state = !done ? '' : i === quiz.answer ? 'correct' : i === picked ? 'wrong' : '';
            return (
              <button key={i} className={`opt reset ${state}`} disabled={done} onClick={() => setPicked(i)}>
                {o}
              </button>
            );
          })}
        </div>
        {done && <p className={`quiz-fb ${right ? 'good' : 'bad'}`}>{right ? quiz.ok : quiz.no}</p>}
        {done && (
          <Button variant="light" className="quiz-retry" onClick={() => setPicked(null)}>
            Réessayer
          </Button>
        )}
      </div>
    </section>
  );
}
