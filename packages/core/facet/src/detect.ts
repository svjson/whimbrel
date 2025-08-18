import {
  FacetId,
  FacetImplementationError,
  FacetModule,
  FacetScope,
  WhimbrelContext,
} from '@whimbrel/core-api'
import { makeFacetDeclarationEntry, makeFacetScope } from './scope'
import { concatDistinct, includesEqual } from '@whimbrel/array'
import { mergeLeft } from '@whimbrel/walk'

/**
 * Describes a stage in the Facet detection chain, allowing
 * the algorithm to detect cyclic references.
 */
interface DetectionStage {
  facet: FacetId
  trigger: {}
}

/**
 * Map of facets and their scopes during the facet detection operation.
 */
type DetectedFacets = Record<FacetId, FacetScope>

/**
 * The context tracking a detection operation.
 */
type DetectionContext = {
  ctx: WhimbrelContext
  result: DetectedFacets
  stack: DetectionStage[]
  dir: string
}

/**
 * Collected a detected Facet into the DetectionContext.
 */
const collectFacet = async (
  detectionCtx: DetectionContext,
  facet: FacetModule,
  scope: FacetScope,
  stage: DetectionStage
) => {
  const { ctx, result, stack } = detectionCtx

  if (includesEqual(stack, stage)) {
    return
  }
  stack.push(stage)

  if (Object.hasOwn(result, facet.id)) {
    concatDistinct(result[facet.id].roles, scope.roles)
    mergeLeft(result[facet.id].config, scope.config ?? {})
  } else {
    result[facet.id] = { ...scope }
  }

  for (const implicit of facet.implicits) {
    if (typeof implicit === 'string') {
      await collectFacet(detectionCtx, ctx.facets.get(implicit), makeFacetScope(), {
        facet: implicit,
        trigger: {
          type: 'implicit',
          source: facet.id,
        },
      })
    } else if (typeof implicit === 'object') {
      await collectFacet(
        detectionCtx,
        ctx.facets.get(implicit.facet),
        makeFacetScope(implicit.scope),
        {
          facet: implicit.facet,
          trigger: {
            type: 'implicit',
            source: facet.id,
          },
        }
      )
    }
  }
}

/**
 * Attempt to detect a specific facet, using the `detect`-implementation of its
 * FacetModule.
 *
 * If the facet is detected at the target of the DetectionContext, its scope is
 * initialized and configured and any advice for additional facet detection is
 * followed.
 */
const detectFacet = async (detectionCtx: DetectionContext, facetModule: FacetModule) => {
  const detectionResult = await facetModule.detect(detectionCtx.ctx, detectionCtx.dir)
  if (!detectionResult.detected) {
    return
  }
  const { facet, advice } = detectionResult

  const invalidDetectionResult = () =>
    new FacetImplementationError(
      `Facet with id '${facetModule.id} returned an invalid FacetDetectionResult`,
      facetModule.id,
      detectionResult
    )

  if (facet) {
    const scope = makeFacetScope(facet.scope)
    await collectFacet(detectionCtx, facetModule, scope, {
      facet: facetModule.id,
      trigger: { type: 'detect' },
    })
  }
  if (advice && advice.facets) {
    if (!Array.isArray(advice.facets)) {
      throw invalidDetectionResult()
    }
    for (const advised of advice.facets) {
      const advisedFacet = makeFacetDeclarationEntry(advised)
      await collectFacet(
        detectionCtx,
        detectionCtx.ctx.facets.get(advisedFacet.facet),
        advisedFacet.scope,
        {
          facet: advisedFacet.facet,
          trigger: { type: 'advised' },
        }
      )
    }
  }
}

/**
 * Detect and analyze facets of the presumed project directory `dir`.
 *
 * @param ctx - The Whimbrel context containing the facet registry.
 * @param dir - The directory to analyze for facets.
 */
export const detectFacets = async (
  ctx: WhimbrelContext,
  dir: string
): Promise<DetectedFacets> => {
  const detectionCtx: DetectionContext = {
    ctx,
    dir,
    stack: [],
    result: {},
  }

  for (const facet of ctx.facets.all()) {
    if (typeof facet.detect === 'function') {
      await detectFacet(detectionCtx, facet)
    }
  }

  return detectionCtx.result
}
