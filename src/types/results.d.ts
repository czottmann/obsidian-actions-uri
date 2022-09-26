type ErrorObject = {
  isSuccess: false;
  error: string;
};

export type SimpleResult = {
  isSuccess: true;
  result: string;
} | ErrorObject;

export type RegexResult = {
  isSuccess: true;
  result: RegExp;
} | ErrorObject;
