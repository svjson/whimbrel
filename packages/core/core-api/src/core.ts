/**
 * WhimbrelError is the base class for all errors thrown by Whimbrel.
 * It extends the built-in Error class and can be used to
 * distinguish Whimbrel-specific errors from other types of errors.
 */
export class WhimbrelError extends Error {
  constructor(
    message: string,
    public cause?: Error
  ) {
    super(message)
  }
}

/**
 * NoDryExecutionError is an error that indicates that a function has
 * been called that is not allowed to execute in a dry run.
 */
export class NoDryExecutionError extends WhimbrelError {
  constructor(fileName: string, funcName: string) {
    super(`${fileName}::${funcName} is not allowed to execute in a dry run.`)
  }
}
