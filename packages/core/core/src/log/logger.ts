import { ApplicationLog, WhimbrelCommandOptions, NullAppender } from '@whimbrel/core-api'

/**
 * Construct or accept an ApplicationLog instance according to the
 * command options.
 */
export const makeLogger = async (
  options: WhimbrelCommandOptions,
  instance?: ApplicationLog
): Promise<ApplicationLog> => {
  if (instance) return instance

  return NullAppender
}
