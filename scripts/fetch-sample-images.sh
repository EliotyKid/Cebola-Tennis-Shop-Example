#!/usr/bin/env bash
# Downloads the sample photos missing from the design system kit (Openverse, CC BY).
# Development only: public/sample/ is git-ignored and must not reach production.
set -euo pipefail
cd "$(dirname "$0")/../public/sample/products"
get() { curl -fsSL -A 'cebola-sample' -o "$1" "$2"; }
get cap-plaid.jpg https://live.staticflickr.com/5611/15600797831_ba5971f9d3_b.jpg
get cap-polo.jpg https://live.staticflickr.com/7491/15938417431_06a05f8712_b.jpg
get string-macro.jpg https://live.staticflickr.com/288/19845010905_de60da3381_b.jpg
