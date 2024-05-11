import { PluginResultObject } from "../types";
import { obsEnv } from "../utils/obsidian-env";
import { failure, success } from "../utils/results-handling";

/**
 * Returns sorted list of the string IDs of the enabled community plugins.
 *
 * @returns {string[]} - A sorted list of enabled community plugins.
 */
export function enabledCommunityPlugins(): string[] {
  const list: string[] = Array.from(
    obsEnv.app.plugins?.enabledPlugins || [],
  );
  return list.sort();
}

/**
 * Checks if a specific community plugin is enabled.
 *
 * @param {string} pluginID - The ID of the plugin to check.
 *
 * @returns {boolean} - True if the plugin is enabled, false otherwise.
 */
export function isCommunityPluginEnabled(pluginID: string): boolean {
  return enabledCommunityPlugins().contains(pluginID);
}

/**
 * Gets the enabled community plugin with the specified ID.
 *
 * @param {string} pluginID The ID of the community plugin to retrieve.
 *
 * @returns {PluginResultObject} A result object containing the plugin if available.
 */
export function getEnabledCommunityPlugin(
  pluginID: string,
): PluginResultObject {
  return isCommunityPluginEnabled(pluginID)
    ? success(obsEnv.app.plugins.getPlugin(pluginID))
    : failure(404, `Community plugin ${pluginID} is not enabled.`);
}

/**
 * Checks if a specific core plugin is enabled.
 *
 * @param {string} pluginID - The ID of the plugin to check.
 *
 * @returns {boolean} - True if the plugin is enabled, false otherwise.
 */
export function isCorePluginEnabled(pluginID: string): boolean {
  return !!obsEnv.app.internalPlugins?.getEnabledPluginById(pluginID);
}

/**
 * Gets the enabled core plugin with the specified ID.
 *
 * @param {string} pluginID The ID of the core plugin to retrieve.
 *
 * @returns {PluginResultObject} A result object containing the plugin if available.
 */
export function getEnabledCorePlugin(pluginID: string): PluginResultObject {
  const plugin = obsEnv.app.internalPlugins?.getEnabledPluginById(pluginID);

  return plugin
    ? success(plugin)
    : failure(404, `Core plugin ${pluginID} is not enabled.`);
}
