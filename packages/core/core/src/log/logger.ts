import { ApplicationLog, WhimbrelCommandOptions, NullAppender } from '@whimbrel/core-api'

/**
 * Construct or accept an ApplicationLog instance according to the
 * command options.
 *
 * @param options - The command options.
 * @param instance - An optional ApplicationLog instance.
 *
 * @return A Promise that resolves to an ApplicationLog instance.
 */
export const makeLogger = async (
  options: WhimbrelCommandOptions,
  instance?: ApplicationLog
): Promise<ApplicationLog> => {
  if (instance && !options.silent) return instance

  return NullAppender
}
