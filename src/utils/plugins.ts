import { PluginResultObject } from "../types";

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

/**
 * Gets the enabled core plugin with the specified ID.
 *
 * @param {string} pluginId The ID of the core plugin to retrieve.
 *
 * @returns {PluginResultObject} A result object containing the plugin if available.
 */
export function getEnabledCorePlugin(pluginId: string): PluginResultObject {
  const { app } = global;
  const plugin = (<any> app).internalPlugins?.getEnabledPluginById(pluginId);

  return plugin
    ? {
      isSuccess: true,
      result: plugin,
    }
    : {
      isSuccess: false,
      errorCode: 404,
      errorMessage: `Core plugin ${pluginId} is not enabled.`,
    };
}
