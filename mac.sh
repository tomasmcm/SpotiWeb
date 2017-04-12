#!/bin/bash

echo '#### Removing old dists ####'
mkdir -p ./distributions
rm -rf ./distributions/SpotiWeb-darwin-x64.zip

cd releases
echo '#### Compressing mac ####'
tar -zcvf ../distributions/SpotiWeb-darwin-x64.tar.gz ./SpotiWeb-darwin-x64/SpotiWeb.app

echo '#### Done Mac version ####'
