import { ErrorObject, ResultObject } from "src/types";

/**
 * Returns a `ResultObject` based on the passed-in parameters.
 *
 * @param result The `ResultObject`'s `result` key
 * @param processedFilepath Optional, the `ResultObject`'s `processedFilepath` key
 * @returns A `ResultObject` with the `isSuccess` key set to `true`
 */
export function success<T>(
  result: T,
  processedFilepath?: string,
): ResultObject<T> {
  return { isSuccess: true, result, processedFilepath };
}

/**
 * Returns an `ErrorObject` based on the passed-in parameters.
 *
 * @param errorCode The `ErrorObject`'s `errorCode` key
 * @param errorMessage The `ErrorObject`'s `errorMessage` key
 * @returns An `ErrorObject` with the `isSuccess` key set to `false`
 */
export function failure(
  errorCode: ErrorCode,
  errorMessage: string,
): ErrorObject {
  return { isSuccess: false, errorCode, errorMessage };
}

export enum ErrorCode {
  notFound = 404,
  pluginUnavailable = 424,
  featureUnavailable = 424,
  unableToCreateNote = 400,
  unableToWrite = 400,
  invalidInput = 406,
  noteAlreadyExists = 409,
  handlerError = 500,
  unknownError = 500,
}
