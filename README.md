# École d’automne Data Science — Institut Agro Rennes (2026)

Site statique, sans framework ni compilation : HTML, CSS et JavaScript natif.

## Contenu

| Fichier | Rôle |
|---|---|
| `index.html` | Structure de la page unique |
| `style.css` | Mise en page, couleurs, responsive, impression |
| `data.js` | **Toutes les données à modifier** : date, salle, conférences |
| `app.js` | Textes FR/EN, vol vidéo, nuage de points 3D, programme |
| `assets/video/` | Vol Google Earth encodé pour le défilement + images de secours |
| `assets/logos/` | Logos à copier (voir ci-dessous) |

## À faire avant publication

1. **Logos** : copier dans `assets/logos/` les fichiers de l’ancien site :
   `Logo_Institut_Agro_Rennes-Angers.png`, `Ensai-logo.png`, `Logo_univ-rennes2-2016.svg`.
   Tant qu’ils manquent, le pied de page affiche les noms en texte.
2. **Résumés** : compléter pour chaque conférence `summary.fr` / `summary.en` dans `data.js`.
   Quand tous sont renseignés, la mention « Les résumés seront publiés prochainement » disparaît.

Date (20 novembre 2026), salle (D4, bâtiment 24) et créneaux de 20 minutes sont déjà renseignés
dans `data.js`. L’ordre du tableau `talks` est l’ordre affiché.

Le plan du campus est `assets/plan-campus.png`. Le repère du bâtiment 24 est positionné en
pourcentage dans `style.css` (`.map-marker { left: 76.1%; top: 44.4%; }`).

## Tester en local (Kubuntu)

```bash
python3 -m http.server 8000
```
puis ouvrir http://localhost:8000. Le serveur local est nécessaire : ouvert en double-clic (`file://`),
le navigateur charge la vidéo moins bien.

## Publier sur GitHub Pages

```bash
git init && git add . && git commit -m "Site école d'automne 2026"
git branch -M main
git remote add origin git@github.com:AntoninR-cmd/ecole-automne-2026.git
git push -u origin main
```
Puis sur GitHub : *Settings → Pages → Deploy from a branch → main / (root)*.

## Refaire la vidéo

La vidéo vient de Google Earth Studio. La mention « Google Earth » doit rester visible :
elle est incrustée dans la vidéo et le site l’ajoute en portrait, où l’incrustation est rognée.
Pour réencoder une nouvelle vidéo (ici les 6 premières secondes) :

```bash
ffmpeg -i film.mp4 -t 6 -an -vf scale=1920:1080 -c:v libx264 -preset veryfast -crf 26 \
  -g 4 -keyint_min 4 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart assets/video/vol-1080.mp4
```
(idem en `scale=1280:720` pour `vol-720.mp4`, et `crop=608:1080:656:0` pour `vol-portrait.mp4`.)
Si la durée change, recalculer la courbe `CURVE` en tête de la section 3 de `app.js`
(ou la remplacer par des valeurs régulières de 0 à la durée).

## Stockage navigateur

- `autumn-language` : langue choisie
- `autumn-favorites` : identifiants des conférences favorites (ne pas changer les `id` après publication)
