import type ActionsURI from "src/main";
import { RealLifePlugin } from "src/types";

let _self: RealLifePlugin;

export function self(): RealLifePlugin;
export function self(pluginInstance: ActionsURI): RealLifePlugin;
export function self(pluginInstance?: ActionsURI): RealLifePlugin {
  if (pluginInstance) _self = pluginInstance as unknown as RealLifePlugin;
  if (!_self) throw new Error("Plugin instance not set");
  return _self;
}
