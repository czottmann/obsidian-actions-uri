import { TFile } from "obsidian";
import { AnyParams } from "src/routes";
import { AnyHandlerResult, NoteProperties } from "src/types";

type ErrorObject = {
  isSuccess: false;
  errorCode: number;
  errorMessage: string;
};

type ResultObject<T> = {
  isSuccess: true;
  result: T;
  processedFilepath?: string;
};

export type TFileResultObject = ResultObject<TFile> | ErrorObject;
export type RegexResultObject = ResultObject<RegExp> | ErrorObject;
export type SearchResultObject =
  | ResultObject<{ hits: string[] }>
  | ErrorObject;
export type StringResultObject = ResultObject<string> | ErrorObject;
export type PluginResultObject = ResultObject<any> | ErrorObject;
export type BooleanResultObject = ResultObject<boolean> | ErrorObject;

export type ProcessingResult = {
  params: AnyParams;
  handlerResult: AnyHandlerResult;
  sendCallbackResult: StringResultObject;
  openResult: StringResultObject;
};

export type NoteDetailsResultObject =
  | ResultObject<{
    filepath: string;
    content: string;
    body: string;
    frontMatter: string;
    properties: NoteProperties;
    uriPath: string;
    uriUID?: string;
    uid?: string | string[];
  }>
  | ErrorObject;
