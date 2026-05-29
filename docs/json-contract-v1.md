# Contrat JSON v1 — sortie du prompt de structuration

Ce contrat définit **exactement** ce que le prompt `haiku-structure-v1` doit
produire à partir d'un message brut Knowledge Scout. Il sert de référence pour :

- le prompt IA (`/prompts/haiku-structure-v1.md`) ;
- la validation dans n8n avant insertion Supabase ;
- le mapping vers `learning_hub.learnings`.

> Version : `v1` — alignée sur `structured_with_prompt_version = 'haiku-structure-v1'`.

---

## 1. Schéma de sortie

```json
{
  "title": "string, max 80 chars",
  "summary": "string, 2-3 phrases",
  "key_points": ["3-5 points courts"],
  "project": "DKM | OptiAI | Next Move | Maestro | perso",
  "themes": ["max 3 thèmes"],
  "business_application": "string, 2-3 phrases",
  "content_angles": ["2-3 angles de contenu"],
  "content_potential": 1,
  "priority": "low | medium | high",
  "recommended_action": "string"
}
```

---

## 2. Description des champs

| Champ | Type | Contraintes | Mapping Supabase |
|---|---|---|---|
| `title` | string | ≤ 80 caractères, pas de markdown | `title` |
| `summary` | string | 2–3 phrases, factuel | `summary` |
| `key_points` | string[] | 3 à 5 items courts | `key_points` (jsonb) |
| `project` | enum | une valeur de la liste fermée | `project` |
| `themes` | string[] | 0 à 3 thèmes courts | `themes` (text[]) |
| `business_application` | string | 2–3 phrases | `business_application` |
| `content_angles` | string[] | 2 à 3 angles | `content_angles` (jsonb) |
| `content_potential` | int | entier **1 à 5** | `content_potential` |
| `priority` | enum | `low` \| `medium` \| `high` | `priority` |
| `recommended_action` | string | 1 phrase actionnable | `recommended_action` |

### Valeurs autorisées

- `project` : `DKM`, `OptiAI`, `Next Move`, `Maestro`, `perso`.
  - Si le projet n'est pas identifiable, utiliser `perso` (valeur prudente).
- `priority` : `low`, `medium`, `high`. Par défaut prudent : `medium`.
- `content_potential` : entier de `1` (faible) à `5` (fort). Par défaut prudent : `2`.

---

## 2bis. JSON Schema (validation machine — n8n)

Schéma validable (Draft 2020-12) à utiliser dans le nœud de validation n8n.
`additionalProperties: false` → **aucune clé supplémentaire** n'est tolérée.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "title", "summary", "key_points", "project", "themes",
    "business_application", "content_angles", "content_potential",
    "priority", "recommended_action"
  ],
  "properties": {
    "title": { "type": "string", "minLength": 1, "maxLength": 80 },
    "summary": { "type": "string", "minLength": 1 },
    "key_points": {
      "type": "array",
      "items": { "type": "string", "minLength": 1 },
      "minItems": 1,
      "maxItems": 5
    },
    "project": { "enum": ["DKM", "OptiAI", "Next Move", "Maestro", "perso"] },
    "themes": {
      "type": "array",
      "items": { "type": "string", "minLength": 1 },
      "maxItems": 3
    },
    "business_application": { "type": "string", "minLength": 1 },
    "content_angles": {
      "type": "array",
      "items": { "type": "string", "minLength": 1 },
      "maxItems": 3
    },
    "content_potential": { "type": "integer", "minimum": 1, "maximum": 5 },
    "priority": { "enum": ["low", "medium", "high"] },
    "recommended_action": { "type": "string", "minLength": 1 }
  }
}
```

> Note : `key_points` vise 3 à 5 items en pratique, mais le schéma tolère 1
> minimum pour ne pas rejeter les messages pauvres (cf. sortie prudente §5).

## 3. Règles strictes

1. **JSON strict uniquement.** La sortie doit être un objet JSON valide et rien d'autre.
2. **Pas de markdown** dans la sortie (ni \`\`\`, ni `**`, ni listes markdown).
3. **Aucun texte avant ou après** le JSON (pas de préambule, pas de commentaire).
4. **Tous les champs sont obligatoires** et doivent être présents, même vides
   (`themes: []` est acceptable ; les autres champs ne doivent pas être inventés
   mais renseignés prudemment).
5. **Si l'information est insuffisante**, choisir une valeur prudente plutôt que
   d'inventer (ex. `priority: "low"`, `content_potential: 2`, `project: "perso"`).
6. **Distinguer faits, hypothèses et applications business** :
   - `summary` et `key_points` = faits issus du message.
   - `business_application` = exploitation/hypothèse business explicite.
   - `content_angles` = pistes de contenu, formulées comme des pistes.
7. **Types respectés** : `content_potential` est un entier JSON (pas une chaîne),
   les tableaux sont des tableaux JSON.
8. **Encodage** : UTF-8, guillemets droits `"`.

---

## 4. Exemple valide

```json
{
  "title": "Les démos courtes convertissent mieux que les démos longues",
  "summary": "Une démo produit de moins de 3 minutes augmente le taux de réponse des prospects. Les démos longues diluent le message clé.",
  "key_points": [
    "Garder la démo sous 3 minutes",
    "Montrer le résultat avant le fonctionnement",
    "Finir par un appel à l'action unique"
  ],
  "project": "OptiAI",
  "themes": ["vente", "démo produit"],
  "business_application": "Refondre le process de démo OptiAI en format court. Tester sur les 5 prochains prospects entrants.",
  "content_angles": [
    "Post LinkedIn : pourquoi vos démos sont trop longues",
    "Court tutoriel : structurer une démo de 3 minutes"
  ],
  "content_potential": 4,
  "priority": "high",
  "recommended_action": "Créer un template de démo courte et le tester cette semaine."
}
```

---

## 5. Cas d'information insuffisante (sortie prudente)

```json
{
  "title": "Note brute non structurée à clarifier",
  "summary": "Le message ne contient pas assez de contexte pour en extraire un apprentissage clair.",
  "key_points": ["Contenu trop court ou ambigu"],
  "project": "perso",
  "themes": [],
  "business_application": "À clarifier avec Dennis avant exploitation.",
  "content_angles": [],
  "content_potential": 1,
  "priority": "low",
  "recommended_action": "Demander des précisions ou archiver."
}
```
