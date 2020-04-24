#!/bin/bash

set -e

rm -rf ./tmp/png/*.png
rm -rf ./tmp/svg/*.svg
curl https://coronavirus.politologue.com/data/coronavirus/coronacsv.aspx?format=json --output data.json --silent
node index.js
ffmpeg -y -i tmp/png/out%*.png -r 15 -vf "fps=15,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" dist/`date +"%Y-%M-%d"
`.gif
