import { pushDistinct } from '@whimbrel/array'
import { FacetQueryFunction } from '@whimbrel/core-api'
import { queryFacets } from '@whimbrel/facet'

/**
 * Query implementation of `http-adapter:port` that responds with
 * the port that the Fastify HTTP adapter is configured to listen to,
 * if it can be determined.
 *
 * @param ctx - The Whimbrel context.
 * @param query - The FacetQuery containing the actor.
 *
 * @return - An array of port resolution objects.
 */
export const queryHttpAdapterPort: FacetQueryFunction<'http-adapter:port'> = async (
  ctx,
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
   * Find invocations of the 'listen'-function on a FastifyInstance and
   * try to resolve the values passed to it.
   */
  const result = await queryFacets(ctx, actor, {
    type: 'language:invocation',
    criteria: {
      functionInvocation: {
        /**
         * The function that starts a Fastify server is called 'listen'
         * and sits on the FastifyInstance-object return by the Fastify
         * factory-function. It is _not_ a class.
         */
        name: 'listen',
        /**
         * The 'listen'-function belongs to an object/instance.
         */
        type: 'instance',
        instance: {
          /**
           * The FastifyInstance object is _not_ a class instance, but
           * the return value of the Fastify factory-function.
           */
          type: 'return-value',
          /**
           * FIXME: This is arbitrary and unused in this case.
           */
          name: 'Fastify',
          /**
           * The Fastify factory-function will be identified as being the
           * default import from the 'fastify' library package/import source.
           */
          from: {
            type: 'library',
            name: 'fastify',
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

    if (argExpr.type === 'builtin-funcall') {
      return {
        type: 'builtin-funcall',
        name: argExpr.name,
        arguments: argExpr.arguments.map(toPortResolution),
      }
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

  const portResults = result.flatMap((fr) =>
    fr.result
      .flatMap((ro) => ro.arguments[0]?.properties.find((e) => e.key === 'port'))
      .map((e) => e.value)
  )

  const [primary, ...fallbacks] = portResults.flatMap(toPortResolution)

  if (!primary && !fallbacks.length) {
    return null
  }
  return { primary, fallbacks }
}
