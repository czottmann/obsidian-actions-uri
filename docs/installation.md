---
nav_order: 1
---

# Installation

1. Search for "Actions URI" in Obsidian's community plugins browser and install it. ([This link should bring it up.](https://obsidian.md/plugins?id=zottmann))
2. Enable the plugin in your Obsidian settings under "Community plugins".

That's it.


# Installation via <abbr title="Beta Reviewers Auto-update Tester">BRAT</abbr> (for pre-releases or betas)

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat).
2. Add "Actions URI" to BRAT:
    1. Open "Obsidian42 - BRAT" via Settings → Community Plugins
    2. Click "Add Beta plugin"
    3. Use the repository address `czottmann/obsidian-actions-uri`
3. Enable "Actions URI" under Settings → Options → Community Plugins


# Development

Clone the repository, run `pnpm install` OR `npm install` to install the dependencies. Afterwards, run `pnpm dev` OR `npm run dev` to compile and have it watch for file changes.
