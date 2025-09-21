import path from 'node:path'
import { makeAnalyzeScaffold } from '@src/operation'
import {
  ExecutionStepBlueprint,
  Task,
  TaskParameter,
  WhimbrelContext,
} from '@whimbrel/core-api'

const resolveFromDefaults = (ctx: WhimbrelContext, param: TaskParameter) => {
  let actorType = 'source'

  for (const alt of param.defaults) {
    if (
      typeof alt === 'object' &&
      Object.hasOwn(alt, 'ref') &&
      (alt as any).ref === 'target'
    ) {
      actorType = 'target'
      break
    }
  }

  return makeAnalyzeScaffold(ctx.cwd, actorType).steps
}

const byConfiguredResolvers = (
  ctx: WhimbrelContext,
  task: Task,
  param: TaskParameter
) => {
  for (let { type, path: sourcePath } of param.resolvers) {
    if (sourcePath?.startsWith('@')) {
      const refVal = ctx.options[sourcePath.slice(1)]
      if (refVal) {
        sourcePath = path.resolve(refVal)
      } else {
        continue
      }
    }

    return makeAnalyzeScaffold(sourcePath, type).steps
  }
}

export const inferPreparationSteps = (ctx: WhimbrelContext, task: Task) => {
  const steps: ExecutionStepBlueprint[] = []

  for (const [param, details] of Object.entries(task.parameters)) {
    if (details.type === 'actor') {
      steps.push(
        ...(byConfiguredResolvers(ctx, task, details) ??
          resolveFromDefaults(ctx, details))
      )
    }
  }

  return steps
}
