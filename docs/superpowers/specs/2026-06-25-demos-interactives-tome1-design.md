# Design — Démos interactives Tome 1 (React)

Date : 2026-06-25
Auteur : Claude Code
Statut : approuvé (Dennis)

## Contexte

Le contenu réel des cours a été extrait des HTML source vers
`src/content/architecture-ia.json` (cf. `docs/content-extraction-v1.md`, D-014).
Les démos interactives d'origine (vanilla JS) ne sont **pas** reconnectées : elles
s'affichent en visuel statique inline. Ce design couvre leur reconstruction en
composants React fonctionnels, **pour le Tome 1 d'abord** (7 démos sur 6 modules).

Décisions de cadrage (validées) :
- **Scope** : Tome 1 d'abord ; Tomes 2 & 3 en lots ultérieurs.
- **Fidélité** : même comportement / même pédagogie que l'original, **reskinné DA
  DKM** (Sand / Ink / Terracotta ; le violet `#4B3FD6` d'origine → Terracotta/Ink).
- **Architecture** : découpage du corps de leçon en **blocs** (html | demo).

## Architecture d'injection — découpage en blocs

### Extraction (`scripts/extract-content.mjs`)

Pour les modules **du Tome 1 uniquement**, le `html` de corps est découpé sur les
frontières `<div class="demo">…</div>` en une liste ordonnée de blocs :

```ts
type Block =
  | { type: 'html'; html: string }
  | { type: 'demo'; key: string; title: string; intro: string }
```

- `key` : identifiant stable `"<moduleId>#<index>"` (ex. `tome1-neurone#0`,
  `tome1-llm#0`, `tome1-llm#1`).
- `title` : texte du `<h3>` de `.demo-head`. `intro` : texte de `.demo-desc`.
- Le markup interactif statique d'origine (sliders, SVG, boutons) est **abandonné** ;
  le composant React le reconstruit.

Tous les modules reçoivent un champ **`body: Block[]`** :
- Modules Tome 1 avec démo → blocs html/demo alternés.
- Modules sans démo extraite (Tomes 2/3, `tome1-fin`) → un seul bloc
  `{ type:'html', html: <corps complet> }`. Leurs démos éventuelles restent inline
  statiques. **Aucune régression.**

Le champ `bodyHtml` est conservé pour compat/inspection mais le rendu utilise `body`.
Invariants d'extraction étendus : exactement 7 blocs `demo` au total, clés attendues
présentes.

### Rendu (`src/App.tsx` → `Lesson`)

```tsx
module.body.map((b, i) =>
  b.type === 'html'
    ? <div key={i} className="lesson-body" dangerouslySetInnerHTML={{__html:b.html}} />
    : <DemoSlot key={i} demoKey={b.key} title={b.title} intro={b.intro} />
)
```

`DemoSlot` lit le **registre** et rend le composant ; clé inconnue → carte statique
de repli (sécurité, ne devrait pas arriver).

## Composants

Dossier `src/demos/` :
- `Demo.tsx` — wrapper partagé : chrome de carte (tag « Interactif », `h3` titre,
  intro), puis `children`.
- `registry.tsx` — `Record<string, React.FC>` clé → composant + `DemoSlot`.
- Un fichier par démo. React pur + `useState`, SVG inline, couleurs via tokens DKM.
- La logique de calcul (perceptron, tokenizer, gradient) est isolée en **fonctions
  pures** en tête de fichier (lisibilité + testabilité).

| Clé | Composant | Interaction (fidèle à l'original) |
|---|---|---|
| `tome1-intro#0` | `NestedCircles` | 3 cercles emboîtés IA/ML/DL ; clic/survol → définition du cercle |
| `tome1-neurone#0` | `Perceptron` | 3 entrées + 3 poids + biais (sliders), bascule ReLU/Sigmoïde, somme pondérée + sortie en direct, neurone SVG qui grossit/s'illumine, épaisseur/couleur des connexions selon contribution, badge « s'active / au repos » |
| `tome1-reseau#0` | `NetworkSignal` | réseau de couches [3,5,4,2] en SVG ; bouton « propager » illumine couche par couche (timers) |
| `tome1-apprentissage#0` | `GradientDescent` | parabole y=x², balle, slider taux d'apprentissage, boutons pas/auto/reset, perte + nb de pas ; un pas = `x ← x − lr·2x` |
| `tome1-transformer#0` | `Attention` | phrase de 8 mots ; clic sur un mot → surligne les autres par poids d'attention (matrice illustrative) |
| `tome1-llm#0` | `Tokenizer` | champ texte → découpe en jetons (regex mots/ponct/apostrophe) en puces + compteur |
| `tome1-llm#1` | `NextWord` | 3 contextes successifs avec barres de probabilité ; clic → avance la génération du mot suivant |

Constantes de données illustratives (matrice d'attention, états de prédiction,
couches du réseau) recopiées **verbatim** depuis le source (pas inventées).

## Styles (`src/styles.css`)

Réutilise la carte `.demo` existante. Ajoute des classes spécifiques en tokens DKM :
sliders (`.demo-slider`), puces de jeton (`.tok`), barres de probabilité, mots
d'attention (`.att-word`), badges, SVG responsive (`max-width:100%`). Palette : trait
principal Terracotta, neutres Ink/rule, surfaces Sand.

## Vérification

1. `npm run extract:content` — idempotent ; 20 modules conservés ; 7 blocs `demo` ;
   clés attendues.
2. `npm run build` OK ; `npm audit` → 0 vuln.
3. Smoke test navigateur de **chacune** des 7 démos (interaction réelle : bouger un
   slider recalcule, propager anime, tokeniser découpe, etc.).
4. Non-régression : une leçon Tome 2 ou 3 rend toujours son corps + démo statique.
5. Console sans erreur.

## Hors scope

Les 7 démos des Tomes 2 & 3 (fenêtre de contexte, RAG, fine-tuning, RLHF, tool use,
boucle ReAct, MCP, prompt injection) restent statiques — lots suivants.
```
