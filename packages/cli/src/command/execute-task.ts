import path from 'node:path'

import { Command } from 'commander'
import kebabCase from 'lodash.kebabcase'
import {
  Blueprint,
  ExecutionStepBlueprint,
  Task,
  WhimbrelContext,
  WhimbrelError,
} from '@whimbrel/core-api'
import {
  inferPreparationSteps,
  makeRunner,
  makeWhimbrelContext,
  materializePlan,
  outputPostExecutionReports,
} from '@whimbrel/core'

import { PROJECT__EACH_SUBMODULE } from '@whimbrel/project'

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
  const executeTaskCommand = program
    .command('execute <task-id> [cmdPath]')
    .alias('x')
    .option('--submodules', 'Target submodules')
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
        const kebabParam = kebabCase(param)

        if (spec.type === 'string') {
          if (spec.required) {
            executeTaskCommand.requiredOption(`--${kebabParam} <${param}>`)
          } else {
            executeTaskCommand.option(`--${kebabParam} <${param}>`)
          }
        } else if (spec.type === 'boolean') {
          if (spec.required) {
            executeTaskCommand.requiredOption(`--${kebabParam}`)
          } else {
            executeTaskCommand.option(`--${kebabParam}`)
          }
        }
      }
    })
}

const resolveCommandInputs = (ctx: WhimbrelContext, task: Task) => {
  const opts = ctx.options as any
  const inputs: any = {}

  for (const [param, spec] of Object.entries(task.parameters)) {
    for (const incompatibleParam of spec.cli.excludes) {
      if (Object.hasOwn(opts, incompatibleParam)) {
        throw new WhimbrelError(
          `Option --${kebabCase(param)} cannot be used in combination with --${kebabCase(incompatibleParam)}`
        )
      }
    }
  }

  for (const [param, spec] of Object.entries(task.parameters)) {
    if (!['string', 'boolean'].includes(spec.type)) continue
    if (Object.hasOwn(opts, param)) {
      inputs[param] = opts[param]
      for (const [opt, val] of Object.entries(spec.cli.sets)) {
        opts[opt] = val === '<<value>>' ? val : opts[param]
      }
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

  const inputs = resolveCommandInputs(ctx, task)
  const submodules = (ctx.options as any).submodules
  const rootModule = (ctx.options as any).rootModule

  ctx.log.banner('Execute Task', taskId, targetDir)

  const taskSteps: ExecutionStepBlueprint[] = []
  if (rootModule) {
    taskSteps.push({
      type: taskId,
      inputs,
    })
  }
  if (submodules) {
    taskSteps.push({
      type: PROJECT__EACH_SUBMODULE,
      inputs: {
        ...inputs,
        task: {
          type: taskId,
          inputs,
        },
      },
      parameters: {
        ...task.parameters,
      },
    })
  }

  const blueprint: Blueprint = {
    steps: [...inferPreparationSteps(ctx, task), ...taskSteps],
  }

  const plan = await materializePlan(ctx, blueprint)
  const runner = makeRunner(ctx, plan)
  await runner.run()

  await outputPostExecutionReports(ctx)
}
