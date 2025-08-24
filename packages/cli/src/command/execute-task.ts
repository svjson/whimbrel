import path from 'node:path'

import { Command } from 'commander'
import { Blueprint, Task, WhimbrelContext } from '@whimbrel/core-api'
import {
  inferPreparationSteps,
  makeRunner,
  makeWhimbrelContext,
  materializePlan,
} from '@whimbrel/core'

import { ALL_OPTION_GROUPS, executeCommand, withCommonOptions } from './common'
import { CLIFormatter, ConsoleAppender } from '@src/output'
import { makeFacetRegistry } from '@src/facets'

/**
 * Defines the Execute Task CLI command.
 *
 * This task executes a specific task identified by its ID.
 * It is typically used to run specific tasks defined in facets
 */
export const addExecuteTaskCommand = (program: Command, preParser: Command) => {
  const executeTaskCommand = program.command('execute <task-id> [cmdPath]').alias('x')
  withCommonOptions(ALL_OPTION_GROUPS, executeTaskCommand).action(
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

  preParser
    .command('execute <task-id> [cmdPath]')
    .alias('x')
    .allowExcessArguments()
    .allowUnknownOption()
    .action(async (taskId: string, _cmdPath, _options: any) => {
      const facets = makeFacetRegistry()
      const task = facets.lookupTask(taskId)

      for (const [param, spec] of Object.entries(task.parameters)) {
        if (spec.type === 'string') {
          if (spec.required) {
            executeTaskCommand.requiredOption(`--${param} <${param}>`)
          } else {
            executeTaskCommand.option(`--${param} <${param}>`)
          }
        }
      }
    })
}

const resolveCommandInputs = (ctx: WhimbrelContext, task: Task) => {
  const opts = ctx.options as any
  const inputs: any = {}

  for (const [param, spec] of Object.entries(task.parameters)) {
    if (spec.type !== 'string') continue
    if (Object.hasOwn(opts, param)) {
      inputs[param] = opts[param]
    }
  }

  return inputs
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
        inputs: resolveCommandInputs(ctx, task),
      },
    ],
  }

  const plan = await materializePlan(ctx, blueprint)
  const runner = makeRunner(ctx, plan)
  await runner.run()
}
