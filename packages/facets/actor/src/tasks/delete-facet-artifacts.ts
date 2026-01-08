import path from 'node:path'
import { Artifact, FacetQueryResult, makeTask, WhimbrelContext } from '@whimbrel/core-api'
import { queryFacets } from '@whimbrel/facet'
import { beginFlow } from '@whimbrel/flow'

/**
 * Global identifier for the DeleteFacetArtifacts task
 */
export const ACTOR__DELETE_FACET_ARTIFACTS = 'actor:delete-facet-artifacts'

/**
 * Executes the DeleteFacetArtifacts task by querying the target Actor for
 * artifacts belonging to facets having the actorRole role.
 *
 * If an origin is provided, only artifacts matching that origin are deleted.
 * All matching artifacts of type 'file' or 'dir' are deleted from the
 * target Actor's filesystem.
 *
 * @param ctx - The WhimbrelContext for the task execution.
 *
 * @returns A Promise that resolves when the task execution is complete.
 */
const execute = async (ctx: WhimbrelContext) => {
  const { target, actorRole, origin } = ctx.step.inputs

  await beginFlow(ctx)
    .let(
      'artifacts',
      (
        await queryFacets(ctx, target, {
          type: `${actorRole}:artifacts`,
          actor: target,
        })
      )
        .flatMap((result: FacetQueryResult<Artifact[]>): Artifact[] => result.result)
        .filter((artifact: Artifact) => (origin ? artifact.origin === origin : true)),
      {
        journal: ({ value }) => ({
          name: 'artifacts',
          value: value.map((v) => v.name).join(', '),
        }),
      }
    )
    .do(async ({ artifacts }) => {
      for (const artifact of artifacts) {
        if (['file', 'dir'].includes(artifact.type)) {
          const fsPath = path.join(target.root, artifact.name)
          if (await ctx.disk.exists(fsPath)) {
            if (artifact.type === 'file') {
              await ctx.disk.delete(fsPath)
            } else if (artifact.type === 'dir') {
              await ctx.disk.rmdir(fsPath)
            }
          }
        }
      }
    })
    .run()
}

/**
 * Whimbrel Task used to delete artifacts created by or belonging to a
 * specific Actor Facet.
 *
 * Requires a target actor and a facet role as inputs.
 *
 * May optionally be filtered by artifact origin.
 */
export const DeleteFacetArtifacts = makeTask({
  id: ACTOR__DELETE_FACET_ARTIFACTS,
  name: 'Delete Actor Facet Artifacts',
  fsMode: 'rw',
  execute,
  parameters: {
    target: {
      type: 'actor',
      required: true,
      defaults: [{ ref: 'target' }],
    },
    actorRole: {
      type: 'string',
      required: true,
    },
    origin: {
      type: 'string',
      required: false,
    },
  },
})

export default DeleteFacetArtifacts
