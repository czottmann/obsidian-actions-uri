import { TFile } from "obsidian";
import { AnyParams } from "../routes";
import { AnyHandlerResult } from "./handlers";

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
  }>
  | ErrorObject;
