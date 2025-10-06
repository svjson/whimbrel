import { PNPM__MIGRATE_WORKSPACES, PNPM__SET_WORKSPACE_DEPENDENCIES } from '@src/tasks'
import {
  ExecutionStep,
  StepAugmentationGenerator,
  WhimbrelContext,
} from '@whimbrel/core-api'

const resolveTarget = (ctx: WhimbrelContext, step: ExecutionStep) => {
  if (step.inputs.target) return step.inputs.target

  if (step.meta?.resolvedParameters?.target?.actorId) {
    return ctx.getActor(step.meta?.resolvedParameters?.target?.actorId)
  }
}

export const migrateProjectAugmentation: StepAugmentationGenerator = async ({
  ctx,
  step,
}) => {
  const steps = []
  const target = resolveTarget(ctx, step)
  if (!target) return steps

  return [
    {
      type: PNPM__MIGRATE_WORKSPACES,
      bind: {
        target: target.name,
        key: 'target',
      },
    },
    {
      type: PNPM__SET_WORKSPACE_DEPENDENCIES,
      bind: {
        target: target.name,
        key: 'target',
      },
    },
    // TODO: tree:delete-file
  ]
}
