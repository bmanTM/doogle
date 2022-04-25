#!/bin/bash
cd ./frontend
npm install
npm run build .
cd ..
npm install
node index.js