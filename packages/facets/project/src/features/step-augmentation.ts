import { PROJECT__DEFINE_SUBMODULES } from '@src/tasks'

export const actorAnalyzeAugmentation = async ({ ctx, step }) => {
  const actorId = step.bind[step.bind.key]
  if (!actorId) return []
  const actor = ctx.getActor(step.bind.key, actorId)
  if (!actor) return []
  const projectFacet = actor.facets.project
  if (!(projectFacet && Array.isArray(projectFacet.config.subModules))) return []
  return [
    {
      type: PROJECT__DEFINE_SUBMODULES,
      steps: projectFacet.config.subModules.map((subModule: any) => ({
        type: 'source:define',
        inputs: {
          source: {
            path: subModule.root,
          },
        },
      })),
    },
  ]
}
