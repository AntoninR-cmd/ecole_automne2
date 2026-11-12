#!/bin/sh
# Prépare dist/, le dossier publié par Netlify : uniquement les fichiers du site.
# Utilisé par netlify.toml ; en local : sh tools/build.sh puis python3 -m http.server -d dist 8000
set -eu
cd "$(dirname "$0")/.."
rm -rf dist
mkdir -p dist
cp index.html 404.html style.css app.js data.js robots.txt dist/
cp -R js vendor assets logos dist/
echo "dist/ prêt : $(find dist -type f | wc -l) fichiers"
