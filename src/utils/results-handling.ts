import { ErrorObject, ResultObject } from "../types";

export function success<T>(
  arg: T,
  processedFilepath?: string,
): ResultObject<T> {
  return {
    isSuccess: true,
    result: arg,
    processedFilepath,
  };
}

export function failure(errorCode: number, errorMessage: string): ErrorObject {
  return {
    isSuccess: false,
    errorCode,
    errorMessage,
  };
}
