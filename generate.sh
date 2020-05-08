#!/bin/bash

set -e

source ./env.sh

gifFileName=dist/`date +"%Y-%m-%d"`.gif

rm -rf ./tmp/png/*.png
rm -rf ./tmp/svg/*.svg

./node_modules/.bin/static & 
assets_pid=$!

curl https://coronavirus.politologue.com/data/coronavirus/coronacsv.aspx?format=json --output data.json --silent

npx tsc

node build/index.js

../ffmpeg-exodus/bin/ffmpeg -y -i tmp/png/out%*.png -r 15 -vf "fps=15,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" $gifFileName

kill -KILL $assets_pid

node build/twitter.js $gifFileName assets/message.txt

