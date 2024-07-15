import { App, debounce, PluginSettingTab, Setting } from "obsidian";
import ActionsURI from "./main";

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
      async (value: string) => {
        settings.frontmatterKey = value.trim() ||
          defaultSettings.frontmatterKey;
        await plugin.saveSettings();
      },
      400,
    );

    containerEl.empty();
    containerEl.createEl("h2", { text: "Actions URI Settings" });

    new Setting(containerEl)
      .setName("UID frontmatter key")
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
    containerEl.createEl("div", {
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
    })
      .innerHTML = `
        <a href="${afoURL}">
          <img
            src="https://actions.work/img/afo-icon.png"
            style="margin: -0.4rem -0.5rem -0.5rem 0; width: 5rem;"
            alt="Actions for Obsidian icon, a cog wheel on a glossy black background">
        </a>
        <span>
          Actions URI is brought to you by
          <a href="${afoURL}"><strong>Actions for Obsidian</strong></a>,
          a macOS/iOS app made by the same developer as this plugin. AFO is the
          missing link between Obsidian and macOS&nbsp;/&nbsp;iOS: 50+ Shortcuts
          actions to bring your notes and your automations together.
          <a href="${afoURL}">Take a look!</a>
        </span>
      `;
  }
}
