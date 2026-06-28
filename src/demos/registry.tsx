import { NestedCircles } from './NestedCircles';
import { Perceptron } from './Perceptron';
import { NetworkSignal } from './NetworkSignal';
import { GradientDescent } from './GradientDescent';
import { Attention } from './Attention';
import { Tokenizer } from './Tokenizer';
import { NextWord } from './NextWord';
import { ContextWindow } from './ContextWindow';
import { RagPipeline } from './RagPipeline';
import { FineTuneCompare } from './FineTuneCompare';
import { RlhfFeedback } from './RlhfFeedback';
import { ToolUse } from './ToolUse';
import { AgentLoop } from './AgentLoop';
import { McpServers } from './McpServers';
import { PromptInjection } from './PromptInjection';

type DemoProps = { title: string; intro: string };
const REGISTRY: Record<string, (p: DemoProps) => React.JSX.Element> = {
  'tome1-intro#0': NestedCircles,
  'tome1-neurone#0': Perceptron,
  'tome1-reseau#0': NetworkSignal,
  'tome1-apprentissage#0': GradientDescent,
  'tome1-transformer#0': Attention,
  'tome1-llm#0': Tokenizer,
  'tome1-llm#1': NextWord,
  'tome2-contexte#0': ContextWindow,
  'tome2-rag#0': RagPipeline,
  'tome2-finetuning#0': FineTuneCompare,
  'tome2-rlhf#0': RlhfFeedback,
  'tome3-tooluse#0': ToolUse,
  'tome3-loop#0': AgentLoop,
  'tome3-mcp#0': McpServers,
  'tome3-garde#0': PromptInjection,
};

export function DemoSlot({ demoKey, title, intro }: { demoKey: string; title: string; intro: string }) {
  const Component = REGISTRY[demoKey];
  if (!Component) {
    // Defensive fallback for an unknown demo key (all 15 are registered above);
    // shows the demo's heading/intro as a static card rather than crashing.
    return (
      <div className="demo">
        <div className="demo-head"><span className="demo-tag">Interaction prévue</span><h3>{title}</h3></div>
        {intro ? <p className="demo-desc">{intro}</p> : null}
      </div>
    );
  }
  return <Component title={title} intro={intro} />;
}
