#!/usr/bin/env fish

argparse "version=" "obsidian-version=" help -- $argv
or return

function usage
    echo '
tag-release.fish

Bumps the plugin version across all release files, commits the change, tags it,
and pushes the commit and tag to the remote. Pushing the tag triggers the GitHub
Actions release workflow, which builds the plugin and creates a draft release.

Run this on `main` — releases are cut straight from `main`.

USAGE:
  bin/tag-release.fish --version <x.y.z> --obsidian-version <x.y.z>

OPTIONS:
  --version           The new plugin version, e.g. 1.9.0. REQUIRED.
  --obsidian-version  The minimum Obsidian version for this release. REQUIRED.
  --help              Show this usage description.

REQUIRES:
  - fish
  - gum
  - jq

OUTPUTS:
  - A "[REL] Release <version>" commit on the current branch
  - A "<version>" git tag
  - Both pushed to the remote
'
end

if set -q _flag_help
    usage
    exit 0
end

# --- Preconditions ---
for cmd in git gum jq
    if not command -q $cmd
        fatal "$cmd is required but not installed"
    end
end

if not set -q _flag_version
    fatal "--version must be set, see --help"
end

if not set -q _flag_obsidian_version
    fatal "--obsidian-version must be set, see --help"
end

if not string match -rq '^\d+\.\d+\.\d+$' -- "$_flag_version"
    fatal "--version must look like x.y.z, got '$_flag_version'"
end

set -l release_tag "$_flag_version"
set -l obsidian_version "$_flag_obsidian_version"

if not gum confirm "New tag '$release_tag', minimum Obsidian version $obsidian_version. Continue?"
    info Aborted
    exit 0
end

info "Updating package.json"
set -l tmp (mktemp)
jq ".version |= \"$release_tag\"" package.json >"$tmp"
or fatal "Failed to update package.json"
mv "$tmp" package.json

info "Updating manifest.json"
set -l tmp (mktemp)
jq ".version |= \"$release_tag\" | .minAppVersion |= \"$obsidian_version\"" \
    manifest.json >"$tmp"
or fatal "Failed to update manifest.json"
mv "$tmp" manifest.json

info "Updating versions.json"
set -l tmp (mktemp)
jq ". += {\"$release_tag\": \"$obsidian_version\"}" versions.json >"$tmp"
or fatal "Failed to update versions.json"
mv "$tmp" versions.json

info "Updating src/plugin-info.json & src/plugin-info.ts"
set -l tmp (mktemp)
set -l date_now (date +%FT%T%z)
jq ".pluginVersion |= \"$release_tag\" | .pluginReleasedAt |= \"$date_now\"" \
    src/plugin-info.json >"$tmp"
or fatal "Failed to update src/plugin-info.json"
mv "$tmp" src/plugin-info.json
echo -n "/* File will be overwritten by bin/tag-release.fish! */
export const PLUGIN_INFO = " >src/plugin-info.ts
cat src/plugin-info.json >>src/plugin-info.ts

echo
info "Committing the following files with message '[REL] Release $release_tag':"
git status --porcelain | while read -l line
    echo "  $line"
end
echo

if not gum confirm "Commit and tag?"
    info "Aborted — working tree left with version bump applied"
    exit 0
end

git commit -m "[REL] Release $release_tag" -a
or fatal "Commit failed"
git tag "$release_tag"
or fatal "Tagging failed"
success "Committed and tagged $release_tag"

if not gum confirm "Push the commit and tag to the remote?"
    info "Commit and tag created locally but not pushed"
    exit 0
end

git push
or fatal "Failed to push commit"
git push --tags
or fatal "Failed to push tags"
success "Pushed. The release workflow will build and create a draft release."
