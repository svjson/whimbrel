import {
  MigrateSubmodule,
  PNPM__MIGRATE_SCRIPTS,
  PNPM__MIGRATE_SUBMODULE,
  PNPM__MIGRATE_WORKSPACES,
  PNPM__SET_WORKSPACE_DEPENDENCIES,
} from '@src/tasks'
import { resolveStepActorRole, StepAugmentationGenerator } from '@whimbrel/core-api'
import { PROJECT__EACH_SUBMODULE } from '@whimbrel/project'

/**
 * StepAugmentationGenerator for PNPM__MIGRATE_PROJECT that emits relevant
 * step augmentations for project migration.
 */
export const migrateProjectAugmentation: StepAugmentationGenerator = async ({
  ctx,
  step,
}) => {
  const steps = []
  const target = resolveStepActorRole(ctx, step, 'target')
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
    {
      type: PNPM__MIGRATE_SCRIPTS,
      bind: {
        target: target.name,
        key: 'target',
      },
    },
    {
      type: PROJECT__EACH_SUBMODULE,
      bind: {
        target: target.name,
        key: 'target',
      },
      inputs: {
        allPackages: true,
        task: {
          type: PNPM__MIGRATE_SUBMODULE,
          inputs: {},
        },
        target: target,
      },
      parameters: {
        ...MigrateSubmodule.parameters,
      },
    },
    // TODO: tree:delete-file
  ]
}

/**
 * StepAugmentationGenerator that augments PNPM__MIGRATE_SUBMODULE with the
 * relevant steps for submodule migration.
 */
export const migrateSubmoduleAugmentation: StepAugmentationGenerator = async ({
  ctx,
  step,
}) => {
  const steps = []
  const target = resolveStepActorRole(ctx, step, 'target')
  if (!target) return steps

  return [
    {
      type: PNPM__SET_WORKSPACE_DEPENDENCIES,
      bind: {
        target: target.name,
        key: 'target',
      },
    },
    {
      type: PNPM__MIGRATE_SCRIPTS,
      bind: {
        target: target.name,
        key: 'target',
      },
    },
  ]
}
