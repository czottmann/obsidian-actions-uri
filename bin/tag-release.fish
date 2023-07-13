#!/opt/homebrew/bin/fish --login

function allow_or_exit
    read -P "$argv[1] Continue? [y/n] " -l response
    switch $response
        case y Y
            echo
            # We're good to go
        case '*'
            echo "Aborting!"
            exit 0
    end
end

argparse \
    "platform=" "patch-version=" "obsidian-version=" help \
    -- $argv
or return

if test -n "$_flag_help"
    echo "
Only works in `release/` branches, e.g. `release/1.0.x` or `release/2.1.x`.

Commits the current changes and tags the commit, effectively marking the commit
as the release commit for the version contained in the branch name.

EXAMPLE:
- If the branch name is `release/1.2.x`, and the patch version is '3', then the
  tag `1.2.3` will be created.

FLAGS:
  --patch-version       Will be added to the branch release number. REQUIRED.
  --obsidian-version    The minimum obsidian version for this release. REQUIRED.
  --help                This usage description.
"
    exit 1
end

if test -z "$_flag_patch_version"
    echo "ERROR: --patch-version must be set, exiting"
    exit 1
end

if test -z "$_flag_obsidian_version"
    echo "ERROR: --obsidian-version must be set, exiting"
    exit 1
end

set git_branch (git branch --show-current)
set release_tag (
        echo $git_branch | cut -d "/" -f 2 | string replace ".x" ".$_flag_patch_version"
    )

allow_or_exit "New tag will be named '$release_tag', minimum Obsidian version is $_flag_obsidian_version."

echo "Updating package.json"
set TEMP_FILE (mktemp)
jq ".version |= \"$release_tag\"" package.json >"$TEMP_FILE"; or exit 1
mv "$TEMP_FILE" package.json

echo "Updating manifest.json"
set TEMP_FILE (mktemp)
jq ".version |= \"$release_tag\" | .minAppVersion |= \"$_flag_obsidian_version\"" \
    manifest.json >"$TEMP_FILE"; or exit 1
mv "$TEMP_FILE" manifest.json

echo "Updating versions.json"
set TEMP_FILE (mktemp)
jq ". += {\"$release_tag\": \"$_flag_obsidian_version\"}" \
    versions.json >"$TEMP_FILE"; or exit 1
mv "$TEMP_FILE" versions.json

echo "Updating src/plugin-info.json & src/plugin-info.ts"
set TEMP_FILE (mktemp)
set DATE_NOW (date +%FT%T%z)
jq ".pluginVersion |= \"$release_tag\" | .pluginReleasedAt |= \"$DATE_NOW\"" \
    src/plugin-info.json >"$TEMP_FILE"; or exit 1
mv "$TEMP_FILE" src/plugin-info.json
echo -n "/* File will be overwritten by bin/release.sh! */
export const PLUGIN_INFO = " >src/plugin-info.ts
cat src/plugin-info.json >>src/plugin-info.ts

echo "Committing the following files with a message of '[REL] Release $release_tag':"
echo
git status --porcelain | sed -E "s/^/  /"
echo

allow_or_exit

git commit -m "[REL] Release $release_tag" -a
git tag $release_tag
echo "Done!"
echo

allow_or_exit "Now pushing the commit and tag to the remote …"

git push --tags
echo "Done!"
echo

allow_or_exit "Now merging branch '$git_branch' into 'main' …"

git checkout main
git pull --tags
git merge -m "[MRG] Merges release '$release_tag'" --no-edit --no-ff $git_branch

allow_or_exit "Push main to remote?"
git push

echo "Done!"
echo
