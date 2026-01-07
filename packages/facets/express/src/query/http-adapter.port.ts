import { pushDistinct } from '@whimbrel/array'
import { FacetQueryFunction, WhimbrelContext } from '@whimbrel/core-api'
import { queryFacets } from '@whimbrel/facet'

/**
 * Query implementation of `http-adapter:port` that responds with
 * the port that the ExpressJS HTTP adapter is configured to listen to,
 * if it can be determined.
 *
 * @param ctx - The Whimbrel context.
 * @param query - The FacetQuery containing the actor.
 *
 * @return - An array of port resolution objects.
 */
export const queryHttpAdapterPort: FacetQueryFunction<'http-adapter:port'> = async (
  ctx: WhimbrelContext,
  { actor }
) => {
  const sourceFolders = (
    await queryFacets(ctx, actor, {
      type: 'project:source-folders',
      actor,
    })
  ).reduce((dirs, result) => {
    pushDistinct(dirs, ...result.result.map((d) => d.absolute))
    return dirs
  }, [])

  /**
   * Find invocations of the 'listen'-function on an express-instance and
   * try to resolve the values passed to it.
   */
  const result = await queryFacets(ctx, actor, {
    type: 'language:invocation',
    criteria: {
      functionInvocation: {
        /**
         * The function that starts an Express server is called 'listen' and
         * sits on the class instance, described by 'instance'
         */
        name: 'listen',
        /**
         * The 'listen'-function belongs to an object/instance.
         */
        type: 'instance',
        instance: {
          /**
           * The main express object is the return-value of the
           * express factory function
           */
          type: 'return-value',
          /**
           * FIXME: This is arbitrary and unused in this case
           */
          name: 'express',
          /**
           * The Koa class will be identified as being the default
           * import from the 'koa' library package/import source.
           */
          from: {
            type: 'library',
            name: 'express',
            importType: 'default',
          },
        },
      },
      sourceFolders,
    },
  })

  const toPortResolution = (argExpr: any) => {
    if (argExpr.type === 'literal') {
      return { type: 'concrete', value: argExpr.value }
    }

    if (argExpr.type === 'process-arg') {
      return { type: 'process-arg', index: argExpr.argIndex.map(toPortResolution) }
    }

    if (argExpr.type === 'process-env') {
      return { type: 'env', name: argExpr.name.map(toPortResolution) }
    }

    if (argExpr.type === 'symbol') {
      if (Array.isArray(argExpr.resolutions) && argExpr.resolutions.length) {
        return argExpr.resolutions.map(toPortResolution)
      }
      return { type: 'concrete', name: argExpr.name }
    }

    if (argExpr.type === 'expression') {
      if (argExpr.resolutions.length) {
        return argExpr.resolutions.map(toPortResolution)
      }

      return {
        type: 'process-arg',
        index: argExpr.argIndex,
      }
    }

    return []
  }

  const [primary, ...fallbacks] = result
    .flatMap((fr) => fr.result.flatMap((ro) => ro.arguments[0]))
    .flatMap(toPortResolution)

  if (!primary && !fallbacks.length) {
    return null
  }
  return { primary, fallbacks }
}
