#!/bin/bash

echo '#### Removing old dists ####'
mkdir -p ./dist
# rm -rf ./dist/SpotiWeb-linux-ia32.tar.gz
rm -rf ./dist/SpotiWeb-linux-x64.tar.gz

cd releases
# echo '#### Compressing linux ia32 ####'
# tar -zcvf ../dist/SpotiWeb-linux-ia32.tar.gz ./SpotiWeb-linux-ia32
echo '#### Compressing linux x64 ####'
tar -zcvf ../dist/SpotiWeb-linux-x64.tar.gz ./SpotiWeb-linux-x64

echo '#### Done Linux versions ####'
