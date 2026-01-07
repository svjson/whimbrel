import { WhimbrelCommandOptions, WhimbrelError } from '@whimbrel/core-api'
import { Command } from 'commander'
import { PlanError } from './types'

export type WhimbrelCommand = () => Promise<void>

export type OptionGroup = 'output' | 'operation' | 'step-tree' | 'property'

export const ALL_OPTION_GROUPS: OptionGroup[] = [
  'output',
  'step-tree',
  'operation',
  'property',
]

/**
 * Adds common options to the command builder.
 *
 * @param cmdBuilder - The command builder to which options will be added.
 * @return - The command builder with common options added.
 */
export const withCommonOptions = (groups: OptionGroup[], cmdBuilder: Command) => {
  if (groups.includes('operation')) {
    cmdBuilder.option('-f, --force', 'Force operation')
  }

  if (groups.includes('step-tree')) {
    cmdBuilder.option('--dry-run', 'Dry run only')
    cmdBuilder.option('-t, --show-step-ids', 'Output Step ID for each step')
    cmdBuilder.option('-c, --cat <fileRef>', 'Output contents of a file, post execution')
    cmdBuilder.option(
      '-d, --show-facet-details [pattern]',
      'Output Facet details for one or all actors.'
    )
    cmdBuilder.option(
      '--max-materialization-iterations <amount>',
      'Set the max number of iterations allowed during the plan materialization phase.'
    )
  }

  if (groups.includes('output')) {
    cmdBuilder
      .option('-v, --verbose', 'Verbose output')
      .option('-s, --silent', 'No output')
      .option('--no-color', 'No color output')
      .option('--plain', 'No ANSI codes. Just plain appending output')
  }

  if (groups.includes('property')) {
    cmdBuilder.option(
      '-p, --prop <key=value>',
      'Set a property (can be used multiple times)',
      (value: string, previous: any) => {
        const [key, ...rest] = value.split('=')
        if (!key || rest.length === 0) {
          throw new Error(`Invalid format for -p: expected key=value`)
        }
        const val = rest.join('=')
        return { ...previous, [key]: val }
      },
      {}
    )
  }
  return cmdBuilder
}

/**
 * Executes a command with error handling.
 *
 * This function takes a command function and options, executes the command,
 * and handles any errors that may occur during execution.
 *
 * If an error occurs, it logs the error message, with a verbosity level
 * depending on the type of error and execution flags, and exits the process
 * with a non-zero status code.
 *
 * Used by all commands.
 *
 * @param cmd - The command function to execute.
 * @param opts - Options for the command execution.
 *
 * @returns A promise that resolves when the command has been executed
 * successfully.
 */
export const executeCommand = async (
  cmd: WhimbrelCommand,
  opts: WhimbrelCommandOptions = { prop: {} }
) => {
  try {
    if (!opts.silent) console.log()
    await cmd()
    if (!opts.silent) console.log()
  } catch (e) {
    if (e instanceof WhimbrelError) {
      if (opts.verbose && e.cause) {
        console.error(e.message)
        console.error(e.cause)
      } else if (opts.verbose) {
        console.error(e)
      } else {
        console.error(e.message)
      }
    } else if (e instanceof PlanError) {
      console.error(e.message)
      console.error(e.cause)
    } else {
      console.error(e)
    }
    process.exit(1)
  }
}
