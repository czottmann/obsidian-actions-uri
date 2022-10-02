---
nav_order: 0
---

<img src="https://raw.githubusercontent.com/czottmann/obsidian-actions-uri/main/readme-assets/actions-uri-128.png" align="left" alt="Plugin logo thingie: an app icon, a two-way communications icon, a note icon">

# Actions URI

Obsidian natively supports a custom URI protocol `obsidian://` which can be used to trigger various actions within the app.  This is commonly used on macOS and mobile apps for automation and cross-app workflows.

**This plugin adds new `x-callback-url` endpoints** to Obsidian so that external sources can better interact with an Obsidian instance by making `GET` requests to a `obsidian://actions-uri/*` URL.  All new routes support `x-success` and `x-error` parameters as a way of communicating back to the sender.

It is a clean, somewhat super-charged addition to Obsidian's [own URI scheme](https://help.obsidian.md/Advanced+topics/Using+obsidian+URI#Using+Obsidian+URIs).


## Author

Carlo Zottmann, <carlo@zottmann.co>

- [GitHub: @czottmann](https://github.com/czottmann)
- [Twitter: @municode](https://twitter.com/municode)
- [Obsidian: @czottmann](https://forum.obsidian.md/u/czottmann)
- [zottmann.co](https://zottmann.co/)
