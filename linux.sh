#!/bin/bash

echo '#### Removing old dists ####'
mkdir -p ./distributions
rm -rf ./distributions/SpotiWeb-linux-ia32.tar.gz
rm -rf ./distributions/SpotiWeb-linux-x64.tar.gz

cd releases
echo '#### Compressing linux ia32 ####'
tar -zcvf ../distributions/SpotiWeb-linux-ia32.tar.gz ./SpotiWeb-linux-ia32
echo '#### Compressing linux x64 ####'
tar -zcvf ../distributions/SpotiWeb-linux-x64.tar.gz ./SpotiWeb-linux-x64

echo '#### Done Linux versions ####'
