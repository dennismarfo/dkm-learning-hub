# Gabarit de pub motion design

Deux fichiers. C'est tout.

- `index.html` : la pub. Trois scènes, quinze secondes, une fonction `render(t)`.
- `render.py` : seize lignes utiles qui la filment et sortent un MP4.

## Essayer en trente secondes

Ouvre `index.html` dans Chrome. Ouvre la console, puis tape :

```js
render(0)
render(5)
render(14)
```

Tu vois l'instant demandé. Il n'y a pas de lecture automatique, et c'est voulu :
`render.py` appelle `render()` image par image pour capturer la vidéo.

## Sortir la vidéo

Une seule fois :

```bash
pip install playwright && playwright install chromium
brew install ffmpeg      # ou : apt install ffmpeg
```

Puis, dans ce dossier :

```bash
python render.py pub.mp4 0 15
```

Compte une à deux minutes. Quinze secondes à trente images par seconde font
450 captures d'écran.

## Changer quelque chose

La charte vit en haut de `index.html`, dans `:root`. Change `--accent`, recharge,
et la couleur a changé dans les trois scènes d'un coup.

Le tableau des scènes vit en bas, dans la constante `S`. Une ligne par scène, avec
sa seconde de début et sa seconde de fin. C'est la structure de toute la pub.

## Les deux règles à ne pas casser

`render(t)` doit être déterministe : même seconde, même image, toujours. Pas
d'animation CSS qui joue toute seule, pas d'horloge réelle, pas de hasard non semé.
Sinon deux rendus donnent deux vidéos différentes.

Les polices doivent être chargées avant la première capture. Ce gabarit utilise les
polices du système pour marcher tout de suite. Dès que tu mets les tiennes, la ligne
`document.fonts.ready` de `render.py` devient indispensable.

---

Le guide complet : <https://dkm-learning-hub.vercel.app/resources/pub-motion>

DKM Learning Hub · apprendre, documenter, construire.
