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
    ? {
      isSuccess: true,
      result: (<any> global.app).plugins.getPlugin(pluginID),
    }
    : {
      isSuccess: false,
      errorCode: 404,
      errorMessage: `Community plugin ${pluginID} is not enabled.`,
    };
}

/**
 * Gets the enabled core plugin with the specified ID.
 *
 * @param {string} pluginID The ID of the core plugin to retrieve.
 *
 * @returns {PluginResultObject} A result object containing the plugin if available.
 */
export function getEnabledCorePlugin(pluginID: string): PluginResultObject {
  const { app } = global;
  const plugin = (<any> app).internalPlugins?.getEnabledPluginById(pluginID);

  return plugin
    ? {
      isSuccess: true,
      result: plugin,
    }
    : {
      isSuccess: false,
      errorCode: 404,
      errorMessage: `Core plugin ${pluginID} is not enabled.`,
    };
}
