#!/bin/bash

echo '#### Removing old dists ####'
mkdir -p ./dist
rm -rf ./dist/SpotiWeb-win32-ia32.zip
# rm -rf ./dist/SpotiWeb-win32-x64.zip

cd releases
echo '#### Compressing win ia32 ####'
zip -r -X ../dist/SpotiWeb-win32-ia32.zip ./SpotiWeb-win32-ia32
# echo '#### Compressing win x64 ####'
# zip -r -X ../dist/SpotiWeb-win32-x64.zip ./SpotiWeb-win32-x64

echo '#### Done Windows versions ####'
