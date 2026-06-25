import { NestedCircles } from './NestedCircles';
import { Perceptron } from './Perceptron';
import { NetworkSignal } from './NetworkSignal';
import { GradientDescent } from './GradientDescent';
import { Attention } from './Attention';
import { Tokenizer } from './Tokenizer';
import { NextWord } from './NextWord';

type DemoProps = { title: string; intro: string };
const REGISTRY: Record<string, (p: DemoProps) => React.JSX.Element> = {
  'tome1-intro#0': NestedCircles,
  'tome1-neurone#0': Perceptron,
  'tome1-reseau#0': NetworkSignal,
  'tome1-apprentissage#0': GradientDescent,
  'tome1-transformer#0': Attention,
  'tome1-llm#0': Tokenizer,
  'tome1-llm#1': NextWord,
};

export function DemoSlot({ demoKey, title, intro }: { demoKey: string; title: string; intro: string }) {
  const Component = REGISTRY[demoKey];
  if (!Component) {
    // Not yet rebuilt (Tomes 2/3) — graceful static fallback.
    return (
      <div className="demo">
        <div className="demo-head"><span className="demo-tag">Interaction prévue</span><h3>{title}</h3></div>
        {intro ? <p className="demo-desc">{intro}</p> : null}
      </div>
    );
  }
  return <Component title={title} intro={intro} />;
}
