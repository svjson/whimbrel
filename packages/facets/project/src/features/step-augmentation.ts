import { PROJECT__DEFINE_SUBMODULES } from '@src/tasks'
import { actorFacetConfig, StepAugmentationGenerator } from '@whimbrel/core-api'

export const actorAnalyzeAugmentation: StepAugmentationGenerator = async ({
  ctx,
  step,
}) => {
  const actorId = step.bind[step.bind.key]
  if (!actorId) return []
  const actor = ctx.getActor(step.bind.key, actorId)
  if (!actor) return []
  const projectCfg = actorFacetConfig(actor, 'project')
  if (
    !(projectCfg && Array.isArray(projectCfg.subModules) && projectCfg.subModules.length)
  )
    return []
  const defineTask = step.bind.key === 'source' ? 'source:define' : 'target:define'
  return [
    {
      type: PROJECT__DEFINE_SUBMODULES,
      steps: projectCfg.subModules.map((subModule: any) => ({
        type: defineTask,
        inputs: {
          [step.bind.key]: {
            path: subModule.root,
          },
        },
      })),
    },
  ]
}

export const eachSubmoduleAugmentation: StepAugmentationGenerator = async ({ step }) => {
  const actor = step.inputs.materialized?.actor ?? step.inputs.materialized?.target
  if (!actor) return []
  const projectFacet = actor.facets.project
  if (!(projectFacet && Array.isArray(projectFacet.config.subModules))) return []
  const inputs = { ...step.inputs }
  delete inputs.materialized

  return projectFacet.config.subModules.map((module: any) => ({
    ...inputs.task,
    bind: {
      target: module.name,
      key: 'target',
    },
  }))
}
