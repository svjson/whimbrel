import path from 'node:path'

import { Command } from 'commander'
import { WhimbrelContext } from '@whimbrel/core-api'
import { analyzePath, outputPostExecutionReports } from '@whimbrel/core'

import { executeCommand, withCommonOptions } from './common'
import { makeCLIWhimbrelContext } from '@src/context'

/**
 * Defines the Analyze CLI command.
 *
 * This command analyzes the specified path or current directory
 * and outputs details about identified facets.
 *
 * @param program - The Commander program instance to which the command
 *                  is added.
 */
export const addAnalyzeCommand = (program: Command) => {
  withCommonOptions(
    ['output', 'step-tree', 'property'],
    program
      .command('analyze [path]')
      .alias('z')
      .option('-i, --facet-info <facet>', 'Output details of a specific facet')
  ).action(async (cmdPath: string, options: any) => {
    executeCommand(async () => {
      if (!cmdPath) {
        cmdPath = path.resolve('.')
      }
      const context = await makeCLIWhimbrelContext(options, cmdPath)
      await runCommand(context, cmdPath)
    }, options)
  })
}

/**
 * Implementation of the Analyze command.
 *
 * Analyzes the specified path or current directory for facets and
 * materializes a plan based on the detected facets.
 *
 * @param ctx - The Whimbrel context containing configuration and state.
 * @param targetDir - The directory to analyze for facets.
 */
export const runCommand = async (ctx: WhimbrelContext, targetDir: string) => {
  ctx.log.banner('Analyze path', targetDir)

  await analyzePath(ctx, targetDir)
  await outputPostExecutionReports(ctx)
}
