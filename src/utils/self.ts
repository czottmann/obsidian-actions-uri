import ActionsURI from "../main";
import { PluginSettings, RealLifeApp } from "../types";

type RealLifeThis = {
  app: RealLifeApp;
  plugin: ActionsURI;
  settings: PluginSettings;
};

let _self: RealLifeThis;

export function self(): RealLifeThis {
  return _self;
}

export function setSelf(globalThis: any) {
  _self = globalThis as RealLifeThis;
}
