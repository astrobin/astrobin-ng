#!/bin/bash -ex

npm ci
npm run build:ssr:prod
npm run serve:ssr
