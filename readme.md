# Covid-19 evolution data visualization

Generate an animated data visualization of Covid-19 evolution.  
Y-axis: infections  
X-axis: deaths  
Animation: time

Data source: politologue.com (french government official data source)

## Install

    npm i

You also need to install FFMPEG (currenty used: 3.4.6).

    sudo apt-get install ffmpeg

The target infrastructure is Amazon Web Services Lambda functions.  
The idea is to call the Lamba function each day: it will produce the Gif and tweet it.  
To do so, we need to have a specific version of FFMEG, bundled by

## Build

    npx tsc

## Generate Gif

    ./node_modules/.bin/static
    ./generate.sh

See dist directory content.
