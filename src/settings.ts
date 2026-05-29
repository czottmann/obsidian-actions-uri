import { App, debounce, PluginSettingTab, Setting } from "obsidian";
import ActionsURI from "src/main";

export class SettingsTab extends PluginSettingTab {
  plugin: ActionsURI;

  constructor(app: App, plugin: ActionsURI) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const {
      containerEl,
      plugin,
      plugin: { settings, defaultSettings },
    } = this;
    const debounceOnChange = debounce(
      async (val: string) => {
        settings.frontmatterKey = val.trim() || defaultSettings.frontmatterKey;
        await plugin.saveSettings();
      },
      400,
    );

    containerEl.empty();

    new Setting(containerEl)
      // eslint-disable-next-line obsidianmd/ui/sentence-case -- "UID" is an initialism; "Uid" would be wrong
      .setName("UID frontmatter key")
      // eslint-disable-next-line obsidianmd/ui/sentence-case -- preserves the "Actions URI" product name and the "UID" initialism
      .setDesc(`
        Actions URI is able to find notes by their UID.
        This unique identifier is stored in the note's frontmatter.
        The plugin needs to know under which frontmatter key it can find the UID. (Default: "uid".)
      `)
      .addText((input) => {
        input
          .setPlaceholder(defaultSettings.frontmatterKey)
          .setValue(settings.frontmatterKey)
          .onChange(debounceOnChange);
      });

    // Sponsoring
    const afoURL =
      "https://actions.work/actions-for-obsidian?ref=plugin-actions-uri";
    const banner = containerEl.createEl("div", {
      attr: {
        style: `
          border-radius: 0.5rem;
          border: 1px dashed var(--text-muted);
          color: var(--text-muted);
          display: grid;
          font-size: 85%;
          grid-gap: 1rem;
          grid-template-columns: auto 1fr;
          margin-top: 4rem;
          opacity: 0.75;
          padding: 1rem;
        `,
      },
    });

    banner.createEl("a", { href: afoURL }).createEl("img", {
      attr: {
        src: "https://actions.work/img/afo-icon.png",
        style: "margin: -0.4rem -0.5rem -0.5rem 0; width: 5rem;",
        alt:
          "Actions for Obsidian icon, a cog wheel on a glossy black background",
      },
    });

    const blurb = banner.createEl("span");
    blurb.appendText("Actions URI is brought to you by ");
    blurb.createEl("a", { href: afoURL })
      .createEl("strong", { text: "Actions for Obsidian" });
    blurb.appendText(
      ", a macOS/iOS app made by the same developer as this plugin. AFO is " +
        "the missing link between Obsidian and macOS / iOS: 50+ " +
        "Shortcuts actions to bring your notes and your automations together. ",
    );
    blurb.createEl("a", { href: afoURL, text: "Take a look!" });
  }
}
