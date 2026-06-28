// Course data is generated from the source HTML by scripts/extract-content.mjs
// (run `npm run extract:content`). Do not edit architecture-ia.json by hand —
// edit the source under content/source/ and re-run the extraction.
import content from './content/architecture-ia.json';

export type Quiz = { question: string; options: string[]; answer: number; ok: string; no: string };
export type Block =
  | { type: 'html'; html: string }
  | { type: 'demo'; key: string; title: string; intro: string };
export type Module = {
  id: string;
  tome: string;
  number: number;
  title: string;
  nav: string;
  eyebrow: string;
  body: Block[];
  minutes: number;
  quiz: Quiz | null;
};
export type GlossaryTerm = { term: string; fr: string; en: string; def: string };
export type ExamQuestion = {
  n: number;
  tome: string;
  question: string;
  options: string[];
  answer: number;
  explain: string;
};
export type CourseContent = {
  slug: string;
  title: string;
  promise: string;
  level: string;
  duration: string;
  glossary: GlossaryTerm[];
  modules: Module[];
  exam: ExamQuestion[];
};

export const course = content as CourseContent;
export const glossary = course.glossary;
export const exam = course.exam;
export const examQuestions = course.exam.length;

export const getModule = (id: string) => course.modules.find((module) => module.id === id);
export const getExam = () => course.exam;
