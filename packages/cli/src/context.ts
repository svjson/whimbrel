import path from 'node:path'

import {
  ApplicationLog,
  makeWhimbrelContext,
  WhimbrelCommandOptions,
} from '@whimbrel/core'
import { makeFacetRegistry } from '@src/facets'

import { CLIFormatter, ConsoleAppender, PlainAppender } from '@src/output'

/**
 * Creates a Whimbrel context suitable for CLI output.
 *
 * @param options - The Whimbrel command options.
 * @param cmdPath - Optional command path to set as the context directory.
 *
 * @return A promise that resolves to the created Whimbrel context.
 */
export const makeCLIWhimbrelContext = async (
  options: WhimbrelCommandOptions,
  cmdPath?: string
) => {
  let log: ApplicationLog = new ConsoleAppender()
  if (options.plain) {
    log = new PlainAppender(log)
  }

  return makeWhimbrelContext(
    {
      cwd: process.cwd(),
      dir: cmdPath ?? path.resolve('.'),
      formatter: CLIFormatter,
      facets: makeFacetRegistry(),
      log,
    },
    options
  )
}
