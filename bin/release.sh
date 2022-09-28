#!/bin/bash

# Thanks to https://github.com/obsidian-tasks-group/obsidian-tasks for this
# script!

set -euo pipefail

if [ "$#" -ne 2 ]; then
    echo "Must provide exactly two arguments."
    echo "First one must be the new version number."
    echo "Second one must be the minimum obsidian version for this release."
    echo ""
    echo "Example usage:"
    echo "./release.sh 0.3.0 0.11.13"
    echo "Exiting."

    exit 1
fi

if [[ $(git status --porcelain) ]]; then
  echo "Changes in the git repo."
  echo "Exiting."

  exit 1
fi

NEW_VERSION=$1
MIN_OBSIDIAN_VERSION=$2
DATE_NOW=$(date +%FT%T%z)

echo "Updating to version ${NEW_VERSION} with minimum Obsidian version ${MIN_OBSIDIAN_VERSION}"

read -p "Continue? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo "Updating package.json"
  TEMP_FILE=$(mktemp)
  jq ".version |= \"${NEW_VERSION}\"" package.json > "$TEMP_FILE" || exit 1
  mv "$TEMP_FILE" package.json

  echo "Updating manifest.json"
  TEMP_FILE=$(mktemp)
  jq ".version |= \"${NEW_VERSION}\" | .minAppVersion |= \"${MIN_OBSIDIAN_VERSION}\"" manifest.json > "$TEMP_FILE" || exit 1
  mv "$TEMP_FILE" manifest.json

  echo "Updating versions.json"
  TEMP_FILE=$(mktemp)
  jq ". += {\"${NEW_VERSION}\": \"${MIN_OBSIDIAN_VERSION}\"}" versions.json > "$TEMP_FILE" || exit 1
  mv "$TEMP_FILE" versions.json

  echo "Updating src/plugin-info.json & src/plugin-info.ts"
  TEMP_FILE=$(mktemp)
  jq ".pluginVersion |= \"${NEW_VERSION}\" | .pluginReleasedAt |= \"${DATE_NOW}\"" src/plugin-info.json > "$TEMP_FILE" || exit 1
  mv "$TEMP_FILE" src/plugin-info.json
  echo "/* File will be overwritten by bin/release.sh! */export const PLUGIN_INFO = $(cat src/plugin-info.json)" > src/plugin-info.ts

  read -p "Create git commit, tag, and push? [y/N] " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]
  then
    git add -A .
    git commit -m"[REL] Releases version ${NEW_VERSION}"
    git tag "${NEW_VERSION}"
    git push
    LEFTHOOK=0 git push --tags
  fi

else
  echo "Exiting."
  exit 1
fi
