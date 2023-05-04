/**
 * Returns sorted list of the string IDs of the enabled community plugins.
 *
 * @returns {string[]} - A sorted list of enabled community plugins.
 */
export function enabledCommunityPlugins(): string[] {
  const list: string[] = Array.from(
    (<any> global.app).plugins?.enabledPlugins || [],
  );
  return list.sort();
}

/**
 * Checks if a community plugin is enabled.
 *
 * @param {string} pluginId - The ID of the plugin to check.
 *
 * @returns {boolean} - True if the plugin is enabled, false otherwise.
 */
export function isCommunityPluginEnabled(pluginId: string): boolean {
  return enabledCommunityPlugins().contains(pluginId);
}
