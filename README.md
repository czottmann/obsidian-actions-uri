<img src="https://raw.githubusercontent.com/czottmann/obsidian-actions-uri/main/readme-assets/actions-uri-128.png" align="left" alt="Plugin logo thingie: an app icon, a two-way communications icon, a note icon">

# Actions URI

This plugin adds additional `x-callback-url` endpoints to [Obsidian](https://obsidian.md) for common actions — it's a clean, super-charged addition to the built-in [Obsidian URIs](https://help.obsidian.md/Advanced+topics/Using+obsidian+URI#Using+Obsidian+URIs), for working with [daily notes, notes, getting search results](https://czottmann.github.io/obsidian-actions-uri/routes/) etc.

## Documentation

For information about available features and routes please see the [documentation](https://czottmann.github.io/obsidian-actions-uri/).

Bug reports and feature requests are welcome, feel free to [open an issue](https://github.com/czottmann/obsidian-actions-uri/issues) here on GitHub. For discussions, please visit the [Plugin Forum](https://forum.actions.work/c/obsidian-actions-uri/6) ("Log in with GitHub" is enabled).


## Plugin Project Status

![GitHub release (latest by date)](https://img.shields.io/github/v/release/czottmann/obsidian-actions-uri?label=current+release&color=09f)
![Maturity: Stable](https://img.shields.io/badge/maturity-stable-09f)
![Development: Active](https://img.shields.io/badge/development-active-09f)
![Support: Active](https://img.shields.io/badge/support-active-09f)

(Please see Don McCurdy's post ["Healthy expectations in open source"](https://www.donmccurdy.com/2023/07/03/expectations-in-open-source/) for information about the different statuses.)


## Installation

1. Search for "Actions URI" in Obsidian's community plugins browser. ([This link should bring it up.](https://obsidian.md/plugins?id=zottmann))
2. Install it.
3. Enable the plugin in your Obsidian settings under "Community plugins".

That's it.


## Installation via <abbr title="Beta Reviewers Auto-update Tester">BRAT</abbr> (for pre-releases or betas)

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat).
2. Add "Actions URI" to BRAT:
    1. Open "Obsidian42 - BRAT" via Settings → Community Plugins
    2. Click "Add Beta plugin"
    3. Use the repository address `czottmann/obsidian-actions-uri`
3. Enable "Actions URI" under Settings → Options → Community Plugins


## Development

This project uses **pnpm** (pinned via `packageManager` in `package.json`). Enable it with `corepack enable`, then clone the repository and run `pnpm install --frozen-lockfile` to install the dependencies.  Afterwards, run `pnpm dev` to compile and have it watch for file changes.


## Releasing

Releases are cut straight from `main`. The whole flow is driven by `bin/tag-release.fish`, which requires `fish`, `gum`, and `jq`.

From a clean `main` with the changes to ship already committed:

```sh
bin/tag-release.fish --version 1.9.0 --obsidian-version 1.8.0
```

`--version` is the new plugin version; `--obsidian-version` is the minimum Obsidian version recorded in `manifest.json` and `versions.json`. The script bumps the version across `package.json`, `manifest.json`, `versions.json`, `src/plugin-info.json`, and `src/plugin-info.ts`, then (after `gum` confirmation prompts) commits as `[REL] Release <version>`, tags the commit `<version>`, and pushes the commit and tag.

Pushing the tag triggers the **Release Obsidian Plugin** GitHub Actions workflow (`.github/workflows/release.yml`), which builds the plugin and creates a **draft** GitHub release with `main.js`, `manifest.json`, and a zipped bundle attached. Edit the draft to add release notes and publish it manually.


## Author

Carlo Zottmann, <carlo@zottmann.dev>, https://c.zottmann.dev, https://github.com/czottmann


## Projects using Actions URI

- [Actions for Obsidian](https://obsidian.actions.work/): Useful new Obsidian actions for the Shortcuts app on macOS and iOS, bridging the gap between your notes and your workflows.

Want to see your project here? Drop me a line! (See "Author" section.)


## Thanks to …

- the [obsidian-tasks](https://github.com/obsidian-tasks-group/obsidian-tasks) crew for the "starter templates" for the GitHub Action workflow and the handy `release.sh` script


## License

MIT, see [LICENSE.md](LICENSE.md).
