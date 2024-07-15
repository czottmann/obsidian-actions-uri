import { ErrorObject, ResultObject } from "../types";

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
export function failure(errorCode: number, errorMessage: string): ErrorObject {
  return { isSuccess: false, errorCode, errorMessage };
}

export enum ErrorCode {
  NotFound = 404,
  PluginUnavailable = 424,
  FeatureUnavailable = 424,
  UnableToCreateNote = 400,
  NoteAlreadyExists = 409,
}
