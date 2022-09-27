import { TFile } from "obsidian";

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
