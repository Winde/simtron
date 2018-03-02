#!/usr/bin/env bash

rm -rf lib
./node_modules/.bin/babel src --out-dir lib;
chmod +x lib/simtron-cli.js;
