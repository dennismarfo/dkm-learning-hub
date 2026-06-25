// Extract real course content from the source HTML files.
//
// The source pages (content/source/*.html) store their content as clean JS data
// literals inside the inline <script>: `const MODULES = [...]`, `const GLOSSARY =
// [...]` per tome, and `const EXAM = [...]` in the exam page. We isolate each
// literal with a string/template/comment-aware bracket matcher (so brackets that
// appear inside strings like `[def]` don't break the scan), evaluate it in an
// isolated vm sandbox, and normalise it into src/content/architecture-ia.json.
//
// No content is invented: everything (prose, quiz answers + corrections, glossary
// definitions, exam answers) comes verbatim from the source literals.
//
// Run: npm run extract:content   (idempotent — re-running yields the same JSON)

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'content', 'source');
const OUT = join(ROOT, 'src', 'content', 'architecture-ia.json');

const TOME_LABELS = {
  1: 'Tome 1 · La fabrique',
  2: "Tome 2 · L'adaptation",
  3: 'Tome 3 · L’action',
};

/**
 * Return the array literal assigned to `const <name> = [ ... ]`, respecting JS
 * string, template-literal and comment context so brackets inside strings are
 * ignored. Returns the substring including the outer brackets.
 */
function extractArrayLiteral(src, name) {
  const decl = new RegExp(`const\\s+${name}\\s*=`);
  const m = decl.exec(src);
  if (!m) throw new Error(`Literal not found: const ${name}`);
  let i = src.indexOf('[', m.index);
  if (i < 0) throw new Error(`No '[' after const ${name}`);
  const start = i;
  let depth = 0;
  let str = null; // current string delimiter: ' " or `
  for (; i < src.length; i++) {
    const c = src[i];
    const next = src[i + 1];
    if (str) {
      if (c === '\\') { i++; continue; } // skip escaped char
      if (c === str) str = null;
      continue;
    }
    // not in a string
    if (c === '/' && next === '/') { i = src.indexOf('\n', i); if (i < 0) i = src.length; continue; }
    if (c === '/' && next === '*') { i = src.indexOf('*/', i + 2) + 1; continue; }
    if (c === '"' || c === "'" || c === '`') { str = c; continue; }
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth === 0) return src.slice(start, i + 1); }
  }
  throw new Error(`Unbalanced brackets while reading const ${name}`);
}

function evalLiteral(literal) {
  // Pure data literals (arrays of objects with string/template values). No DOM
  // references inside them, so an empty sandbox is sufficient.
  return vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 5000 });
}

function readSource(file) {
  return readFileSync(join(SRC, file), 'utf8');
}

function minutesFor(html) {
  const words = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length;
  return Math.max(4, Math.round(words / 140));
}

const stripTags = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

// Find [start,end] spans of each top-level `<div class="demo">…</div>` by
// depth-counting div open/close tags (demos contain nested divs).
function findDemoSpans(html) {
  const spans = [];
  const open = /<div class="demo">/g;
  let m;
  while ((m = open.exec(html))) {
    const start = m.index;
    const tag = /<\/?div\b[^>]*>/g;
    tag.lastIndex = start;
    let depth = 0;
    let t;
    while ((t = tag.exec(html))) {
      depth += t[0].startsWith('</') ? -1 : 1;
      if (depth === 0) {
        spans.push([start, tag.lastIndex]);
        open.lastIndex = tag.lastIndex;
        break;
      }
    }
  }
  return spans;
}

// Split a module body into ordered blocks. Demos are split out only for Tome 1
// (the lot being rebuilt in React); everything else stays a single html block.
function splitBody(html, keyBase, splitDemos) {
  const trimmed = html.trim();
  if (!splitDemos) return [{ type: 'html', html: trimmed }];
  const spans = findDemoSpans(trimmed);
  if (!spans.length) return [{ type: 'html', html: trimmed }];
  const blocks = [];
  let cursor = 0;
  let di = 0;
  for (const [s, e] of spans) {
    const before = trimmed.slice(cursor, s).trim();
    if (before) blocks.push({ type: 'html', html: before });
    const demoHtml = trimmed.slice(s, e);
    const title = (demoHtml.match(/<h3>([\s\S]*?)<\/h3>/) || [, ''])[1];
    const intro = (demoHtml.match(/<p class="demo-desc">([\s\S]*?)<\/p>/) || [, ''])[1];
    blocks.push({ type: 'demo', key: `${keyBase}#${di}`, title: stripTags(title), intro: stripTags(intro) });
    di++;
    cursor = e;
  }
  const after = trimmed.slice(cursor).trim();
  if (after) blocks.push({ type: 'html', html: after });
  return blocks;
}

const TOME_FILES = [
  { n: 1, file: 'architecture-ia-tome1.html' },
  { n: 2, file: 'architecture-ia-tome2.html' },
  { n: 3, file: 'architecture-ia-tome3.html' },
];

const modules = [];
const glossaryByTerm = new Map();
const glossaryCounts = {};
let number = 0;

for (const { n, file } of TOME_FILES) {
  const src = readSource(file);
  const mods = evalLiteral(extractArrayLiteral(src, 'MODULES'));
  const gloss = evalLiteral(extractArrayLiteral(src, 'GLOSSARY'));
  glossaryCounts[n] = gloss.length;

  for (const m of mods) {
    number++;
    const q = m.quiz;
    const id = `tome${n}-${m.id}`;
    const bodyHtml = String(m.html).trim();
    modules.push({
      id,
      tome: TOME_LABELS[n],
      number,
      title: m.title,
      nav: m.nav,
      eyebrow: m.eyebrow,
      bodyHtml,
      body: splitBody(bodyHtml, id, n === 1),
      minutes: minutesFor(bodyHtml),
      quiz: q
        ? { question: q.q, options: q.opts, answer: q.correct, ok: q.ok, no: q.no }
        : null,
    });
  }

  for (const g of gloss) {
    if (!glossaryByTerm.has(g.a)) {
      glossaryByTerm.set(g.a, { term: g.a, fr: g.fr || '', en: g.en || '', def: g.d });
    }
  }
}

// Exam
const examSrc = readSource('examen-final-ia.html');
const examRaw = evalLiteral(extractArrayLiteral(examSrc, 'EXAM'));
const exam = examRaw.map((e, idx) => ({
  n: idx + 1,
  tome: TOME_LABELS[e.t],
  question: e.q,
  options: e.opts,
  answer: e.c,
  explain: e.exp || '',
}));

const content = {
  slug: 'architecture-ia',
  title: 'Architecture IA : du neurone à l’agent',
  promise:
    'Comprends l’IA moderne depuis les bases, puis relie chaque concept aux workflows, agents et décisions business.',
  level: 'Débutant → builder',
  duration: `3 tomes · ${modules.length} modules · examen final`,
  glossary: [...glossaryByTerm.values()],
  modules,
  exam,
};

// --- Sanity assertions (fail loudly rather than emit silently-wrong data) ---
const errors = [];
if (modules.length !== 20) errors.push(`expected 20 modules, got ${modules.length}`);
if (exam.length !== 18) errors.push(`expected 18 exam questions, got ${exam.length}`);
const expectGloss = { 1: 16, 2: 16, 3: 14 };
for (const [n, c] of Object.entries(expectGloss)) {
  if (glossaryCounts[n] !== c) errors.push(`tome ${n}: expected ${c} glossary terms, got ${glossaryCounts[n]}`);
}
for (const m of modules) {
  if (!m.bodyHtml) errors.push(`module ${m.id}: empty bodyHtml`);
  if (m.quiz && (m.quiz.answer == null || !m.quiz.options[m.quiz.answer])) {
    errors.push(`module ${m.id}: invalid quiz answer index`);
  }
}
for (const e of exam) {
  if (e.answer == null || !e.options[e.answer]) errors.push(`exam Q${e.n}: invalid answer index`);
}
for (const g of content.glossary) {
  if (!g.def) errors.push(`glossary ${g.term}: empty definition`);
}
const demoKeys = modules.flatMap((m) => m.body.filter((b) => b.type === 'demo').map((b) => b.key));
const EXPECTED_DEMO_KEYS = [
  'tome1-intro#0',
  'tome1-neurone#0',
  'tome1-reseau#0',
  'tome1-apprentissage#0',
  'tome1-transformer#0',
  'tome1-llm#0',
  'tome1-llm#1',
];
if (demoKeys.length !== EXPECTED_DEMO_KEYS.length || EXPECTED_DEMO_KEYS.some((k) => !demoKeys.includes(k))) {
  errors.push(`expected demo blocks [${EXPECTED_DEMO_KEYS.join(', ')}], got [${demoKeys.join(', ')}]`);
}
if (errors.length) {
  console.error('Extraction failed:\n - ' + errors.join('\n - '));
  process.exit(1);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(content, null, 2) + '\n', 'utf8');

const withQuiz = modules.filter((m) => m.quiz).length;
console.log(
  `OK → ${OUT}\n` +
    `  modules: ${modules.length} (quiz: ${withQuiz})\n` +
    `  glossary (merged unique): ${content.glossary.length}  [per tome: ${glossaryCounts[1]}/${glossaryCounts[2]}/${glossaryCounts[3]}]\n` +
    `  exam questions: ${exam.length}`,
);
