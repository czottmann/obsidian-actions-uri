#!/bin/bash

# Dependencies: https://github.com/chmln/sd

for F in src/routes/*.ts; do
ls $F
  grep '  \/\/' $F \
    | sd ' //' '' \
    | sd '^\s*\}' '' \
    | sd '^\s*\{' "| Parameter | Value | optional | |\n| --- | --- | --- | --- |" \
    | sd '^\s*"*(.+?)"*(\?*): (.+);' '| `$1` | $3 | $2 |' \
    | sd --string-mode '| undefined ' '' \
    | sd --string-mode '| ? |' '| yes |' \
    | sd '^ +' '' \
    > docs/route--$(basename $F .ts).md
done
