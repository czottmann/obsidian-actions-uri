import { TFile } from "obsidian";
import { AnyParams } from "../routes";
import { AnyHandlerResult } from "./handlers";

type ErrorObject = {
  isSuccess: false;
  error: string;
};

export type StringResultObject = {
  isSuccess: true;
  result: string;
} | ErrorObject;

export type RegexResultObject = {
  isSuccess: true;
  result: RegExp;
} | ErrorObject;

export type TFileResultObject = {
  isSuccess: true;
  result: TFile;
} | ErrorObject;

export type ProcessingResult = {
  params: AnyParams;
  handlerResult: AnyHandlerResult;
  sendCallbackResult: StringResultObject;
  openResult: StringResultObject;
};
