/**
 * FlowError is a custom error class for handling errors in flow execution.
 * It extends the built-in Error class and includes additional metadata.
 * It can be used to provide more context about the error that occurred during
 * the execution of a flow.
 */
export class FlowError extends Error {
  constructor(
    message: string,
    public meta: any
  ) {
    super(message)
  }
}
