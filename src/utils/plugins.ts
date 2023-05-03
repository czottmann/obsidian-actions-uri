export function isTemplaterEnabled(): boolean {
  const { app } = window;
  return (<any> app).plugins.enabledPlugins.has("templater-obsidian");
}
