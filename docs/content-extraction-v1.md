# Content extraction v1 — Architecture IA

Date : 2026-06-25
Auteur : Claude Code

Ce document décrit comment le contenu réel du cours « Architecture IA » est extrait
des HTML source et consommé par le frontend.

## Sources

Fichiers d'origine (provenance, conservés en repo) :

```
content/source/architecture-ia-tome1.html
content/source/architecture-ia-tome2.html
content/source/architecture-ia-tome3.html
content/source/examen-final-ia.html
```

Chaque page embarque son contenu dans des **littéraux JS** propres, dans le
`<script>` inline :

- `const MODULES = [{ id, nav, title, eyebrow, html:`…`, quiz:{q,opts,correct,ok,no} }]`
  (par tome)
- `const GLOSSARY = [{ a, en, fr, d }]` (par tome) — `a` = sigle/terme, `d` = définition
- `const EXAM = [{ t, q, opts, c, exp }]` (page examen) — `c` = index de la bonne réponse

Tout le contenu haute fidélité est donc déjà structuré à la source : prose,
définitions, notes, démos, **bonnes réponses + corrections de quiz**, définitions de
glossaire, réponses d'examen. **Aucun contenu n'est inventé** (règle CLAUDE.md #2).

## Extraction

`scripts/extract-content.mjs` (Node, zéro dépendance) :

1. Pour chaque fichier, isole chaque littéral `const NAME = [ … ]` avec un scanner
   **conscient des chaînes / templates / commentaires** (les `[` `]` à l'intérieur de
   chaînes — ex. `[def]` — ne cassent pas le découpage).
2. Évalue le littéral dans un sandbox `vm` isolé (données pures, aucun accès DOM).
3. Normalise vers le schéma cible, en **conservant le `html` de corps tel quel**.
4. Vérifie des invariants (cf. ci-dessous) puis écrit `src/content/architecture-ia.json`.

Commande (idempotente) :

```
npm run extract:content
```

### Schéma émis (`src/content/architecture-ia.json`)

```ts
Quiz         = { question, options[], answer, ok, no }
Module       = { id, tome, number, title, nav, eyebrow, bodyHtml, minutes, quiz|null }
GlossaryTerm = { term, fr, en, def }
ExamQuestion = { n, tome, question, options[], answer, explain }
CourseContent= { slug, title, promise, level, duration, glossary[], modules[], exam[] }
```

Types côté app : `src/course-data.ts` (importe le JSON, le typifie, expose `course`,
`getModule`, `getExam`, `glossary`, `exam`).

### Invariants vérifiés à l'extraction

- 20 modules (Tome 1 : 8, Tome 2 : 6, Tome 3 : 6) ; `bodyHtml` non vide.
- 18 questions d'examen ; chaque quiz / question d'examen a un `answer` valide.
- Glossaires par tome : 16 / 16 / 14 (fusionnés et dédupliqués → 41 termes uniques).

Le script échoue bruyamment (`process.exit(1)`) si un invariant casse, plutôt que
d'émettre du JSON silencieusement faux.

## Rendu frontend

- `Lesson` (`src/App.tsx`) rend `bodyHtml` via `dangerouslySetInnerHTML` (contenu de
  confiance, issu de nos propres sources) ; le quiz est un composant React interactif.
- Les classes du corps source (`.lead`, `.define`, `.demo`, `.note`, `.acro`, etc.)
  sont stylées dans `src/styles.css` avec la DA DKM (Sand / Ink / Terracotta).

## Suivi : démos interactives à reconstruire

Les démos source reposent sur du JS inline non réimporté. Elles s'affichent en
**visuel statique fidèle** (SVG + contrôles inertes). À reconstruire en composants
React fonctionnels (14 démos) :

| Module | Démo |
|---|---|
| tome1-intro | Les cercles emboîtés (IA/ML/DL) |
| tome1-neurone | Fais « tirer » un neurone |
| tome1-reseau | Le signal traverse le réseau |
| tome1-apprentissage | Descente de gradient |
| tome1-transformer | Sur quoi un mot porte-t-il attention ? |
| tome1-llm | Découpe un texte en tokens · « Le prochain mot après… » |
| tome2-contexte | Remplis la fenêtre jusqu'au débordement |
| tome2-rag | Un mini-pipeline RAG |
| tome2-finetuning | Avant / après spécialisation |
| tome2-rlhf | Sois l'humain qui donne le retour |
| tome3-tooluse | Regarde le modèle choisir un outil |
| tome3-loop | Une tâche en plusieurs tours |
| tome3-mcp | Branche des serveurs, vois les outils apparaître |
| tome3-garde | Repère le piège (prompt injection) |

## Régénérer après modification du contenu

1. Modifier le HTML sous `content/source/` (jamais le JSON directement).
2. `npm run extract:content`.
3. `npm run build` + smoke test.
