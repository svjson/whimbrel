import { makeAnalyzeScaffold } from '@src/operation'
import { ExecutionStepBlueprint, Task, WhimbrelContext } from '@whimbrel/core-api'

export const inferPreparationSteps = (ctx: WhimbrelContext, task: Task) => {
  const steps: ExecutionStepBlueprint[] = []

  for (const [param, details] of Object.entries(task.parameters)) {
    if (details.type === 'actor') {
      let actorType = 'source'

      for (const alt of details.defaults) {
        if (typeof alt === 'object' && alt.ref === 'target') {
          actorType = 'target'
          break
        }
      }
      steps.push(...makeAnalyzeScaffold(ctx.cwd, actorType).steps)
    }
  }

  return steps
}
