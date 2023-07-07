---
nav_order: 0
---

<img src="https://raw.githubusercontent.com/czottmann/obsidian-actions-uri/main/readme-assets/actions-uri-128.png" align="left" alt="Plugin logo thingie: an app icon, a two-way communications icon, a note icon">

# Actions URI

Obsidian natively supports a custom URI protocol `obsidian://` which can trigger various actions within the app. This is commonly used on macOS and mobile apps for automation and cross-app workflows.

**This plugin adds new `x-callback-url` endpoints** to Obsidian so that external sources can better interact with an Obsidian instance by making `GET` requests to a `obsidian://actions-uri/*` URL.  All new routes support `x-success` and `x-error` parameters as a way of communicating back to the sender.

It's a clean, somewhat super-charged addition to Obsidian's [own URI scheme](https://help.obsidian.md/Advanced+topics/Using+obsidian+URI#Using+Obsidian+URIs).


## Author

Carlo Zottmann, <carlo@zottmann.co>

- GitHub: [@czottmann](https://github.com/czottmann)
- Mastodon: [@czottmann@norden.social](https://norden.social/@czottmann) & [@obsidian@actions.work](https://actions.work/@obsidian)
- Obsidian: [@czottmann](https://forum.obsidian.md/u/czottmann)
- Website: [zottmann.co](https://zottmann.co/)


## Projects using Actions URI

- [Actions for Obsidian](https://obsidian.actions.work/): Useful new Obsidian actions for the Shortcuts app on macOS and iOS, bridging the gap between your notes and your workflows.

Want to see your project here? Drop me a line! (See "Author" section.)


## Project status

![GitHub release (latest by date)](https://img.shields.io/github/v/release/czottmann/obsidian-actions-uri?label=current+release)
![Maturity: Stable](https://img.shields.io/badge/maturity-stable-blue)
![Development: Active](https://img.shields.io/badge/development-active-blue)
![Support: Active](https://img.shields.io/badge/support-active-blue)

(Regarding the different statuses, please see Don McCurdy's post ["Healthy expectations in open source"](https://www.donmccurdy.com/2023/07/03/expectations-in-open-source/).)
