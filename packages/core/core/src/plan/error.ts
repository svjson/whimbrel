/**
 * PlanError is a specific error type used to indicate that an error
 * occurred while processing a plan.
 */
export class PlanError extends Error {
  constructor(
    message: string,
    public cause?: Error
  ) {
    super(message)
  }
}
