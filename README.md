# École d’automne Data Science — Institut Agro Rennes (2026)

Site statique, sans framework ni compilation : HTML, CSS et JavaScript natif.
En ligne : https://ecole-automne-data-science.netlify.app

## Contenu

| Fichier | Rôle |
|---|---|
| `index.html` | Structure de la page unique |
| `style.css` | Mise en page, couleurs, responsive, impression, page 404 |
| `data.js` | **Toutes les données à modifier** : date, salle, conférences |
| `app.js` | Textes FR/EN, pilotage du vol, nuage de points 3D dessiné, programme |
| `js/campus3d.js` | Vol 3D « croquis » au-dessus du campus (module, Three.js) |
| `assets/campus.json` | Bâtiments, rues, arbres du quartier (extraits d’OpenStreetMap) |
| `assets/vol-plan*.webp` | Image du plan affichée pendant le chargement et sans WebGL |
| `vendor/` | Three.js 0.170.0 (licence MIT), servi localement |
| `tools/` | Extraction OSM (`osm_to_campus.py`) et préparation du déploiement (`build.sh`) |
| `logos/` | Logos des établissements |

## Style

Thème « conceptual sketch » : papier quadrillé, bordures à main levée, titres manuscrits
(polices Google Fonts **Kalam** et **Caveat**, chargées en ligne), surlignage au marqueur,
annotations fléchées et figures 3D légendées « fig. 01 … ». Les couleurs sont des variables
en tête de `style.css` (encre, orange Institut Agro, vert d’eau).

## Le vol vers le campus (section 1)

Une maquette 3D du quartier, générée à partir des emprises OpenStreetMap, est dessinée comme
dans un carnet : contours à l’encre légèrement tremblés, hachures sur les faces à l’ombre,
ombres portées hachurées, pelouses en pointillés, quadrillage du papier en perspective.
Le défilement fait descendre la caméra du plan vu de dessus jusqu’au **bâtiment 24 (salle D4)**,
surligné en orange ; les bâtiments « poussent » pendant la descente.

- Trajectoire : tableaux `PATH_WIDE` (écran large) et `PATH_TALL` (portrait) en tête de
  `js/campus3d.js` — une ligne par étape : avancement, point visé, distance, inclinaison, cap.
- Annotations manuscrites (rue, entrée, bât. 11, bât. 24) : fonction `buildLabels`.
- Résistance en fin de vol : `HOLD` (`app.js`, section 3) = part finale du défilement pendant
  laquelle la vue reste sur le bâtiment 24 ; le défilement s’y accroche (`scroll-snap`, proximité).
- Sans WebGL 2, l’image `assets/vol-plan.webp` reste affichée.

Pour régénérer les données après une mise à jour d’OpenStreetMap :

```bash
curl -o campus.osm "https://api.openstreetmap.org/api/0.6/map?bbox=-1.7160,48.1088,-1.6985,48.1178"
python3 tools/osm_to_campus.py campus.osm assets/campus.json
```

Les données OpenStreetMap sont sous licence ODbL : la mention « © OpenStreetMap » doit rester
visible (en bas du vol et dans le pied de page).

## Le nuage de points (section 2)

Chaque conférence est illustrée par un nuage de points 3D dessiné à la main : boîte d’axes
tracée à main levée, graduations manuscrites, marqueurs ● ○ × + △ par classe, légende et
annotations fléchées. Les points se réorganisent d’un sujet à l’autre au défilement.
Les figures sont décrites dans `FIGS` (`app.js`, section 4) ; le champ `shape` de chaque
conférence dans `data.js` choisit la figure.
Chaque carte reste épinglée au centre pendant `--dwell` de défilement (`.talk-card` dans
`style.css`) et le défilement s’accroche au milieu de cette pause.

## Données

Date (20 novembre 2026, 13h30 – 16h30), salle (D4, bâtiment 24) et créneaux de 20 minutes
sont renseignés dans `data.js`. L’ordre du tableau `talks` est l’ordre affiché.
Il reste à compléter `summary.fr` / `summary.en` pour chaque conférence : la mention
« Les résumés seront publiés prochainement » disparaît quand tous sont remplis.

Le plan du campus est `assets/plan-campus.png`. Le repère du bâtiment 24 est positionné en
pourcentage dans `style.css` (`.map-marker { left: 76.1%; top: 44.4%; }`).

## Tester en local

```bash
python3 -m http.server 8000
```
puis ouvrir http://localhost:8000. Le serveur local est nécessaire : ouvert en double-clic
(`file://`), le navigateur bloque le module 3D et le chargement des données.

## Publier sur Netlify

`netlify.toml` lance `tools/build.sh`, qui copie uniquement les fichiers du site dans `dist/`,
et ajoute les en-têtes de sécurité (CSP) et de cache. Une page `404.html` est fournie.

- Déploiement manuel : `sh tools/build.sh` puis `netlify deploy --prod --dir dist`.
- Déploiement continu : dans Netlify, *Project configuration → Build & deploy → Link repository*,
  choisir ce dépôt ; chaque push sur la branche de production redéploie le site.

## Stockage navigateur

- `autumn-language` : langue choisie
- `autumn-favorites` : identifiants des conférences favorites (ne pas changer les `id` après publication)
