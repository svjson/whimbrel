import path from 'node:path'

import { Command } from 'commander'
import { Blueprint, WhimbrelContext } from '@whimbrel/core-api'
import {
  inferPreparationSteps,
  makeRunner,
  makeWhimbrelContext,
  materializePlan,
} from '@whimbrel/core'

import { executeCommand, withCommonOptions } from './common'
import { CLIFormatter, ConsoleAppender } from '@src/output'
import { makeFacetRegistry } from '@src/facets'

/**
 * Defines the Execute Task CLI command.
 *
 * This task executes a specific task identified by its ID.
 * It is typically used to run specific tasks defined in facets
 */
export const addExecuteTaskCommand = (program: Command) => {
  withCommonOptions(program.command('execute <task-id> [cmdPath]').alias('x')).action(
    async (taskId: string, cmdPath, options: any) => {
      executeCommand(async () => {
        if (!cmdPath) {
          cmdPath = path.resolve('.')
        }
        const context = await makeWhimbrelContext(
          {
            cwd: process.cwd(),
            dir: cmdPath,
            formatter: CLIFormatter,
            facets: makeFacetRegistry(),
            log: new ConsoleAppender(),
          },
          options
        )
        await executeTask(context, taskId, cmdPath)
      }, options)
    }
  )
}

/**
 * Implementation of the Execute Task command.
 *
 * @param ctx - The Whimbrel context containing configuration and state.
 * @param taskId - The ID of the Task to execute.
 * @param targetDir - The directory in which to execute the task.
 */
export const executeTask = async (
  ctx: WhimbrelContext,
  taskId: string,
  targetDir: string
) => {
  const task = ctx.facets.lookupTask(taskId)

  ctx.log.banner('Execute Task', taskId, targetDir)

  const blueprint: Blueprint = {
    steps: [
      ...inferPreparationSteps(ctx, task),
      {
        type: taskId,
      },
    ],
  }

  const plan = await materializePlan(ctx, blueprint)
  const runner = makeRunner(ctx, plan)
  await runner.run()
}
