import { TFile } from "obsidian";
import { AnyParams } from "../routes";
import { AnyHandlerResult } from "./handlers";

type ErrorObject = {
  isSuccess: false;
  error: string;
};

type ResultObject<T> = {
  isSuccess: true;
  result: T;
};

export type TFileResultObject = ResultObject<TFile> | ErrorObject;
export type RegexResultObject = ResultObject<RegExp> | ErrorObject;
export type SearchResultObject =
  | ResultObject<{ hits: string[] }>
  | ErrorObject;
export type StringResultObject = ResultObject<string> | ErrorObject;

export type ProcessingResult = {
  params: AnyParams;
  handlerResult: AnyHandlerResult;
  sendCallbackResult: StringResultObject;
  openResult: StringResultObject;
};
