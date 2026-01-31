import { parseViteConfiguration } from '@src/lib/vite-config'
import { FacetQueryFunction, ValueResolution, WhimbrelContext } from '@whimbrel/core-api'

/**
 * Query implementation of `http-adapter:port` that responds with
 * the port that a vite dev server uses.
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
  const viteConfig = await parseViteConfiguration(ctx, actor.root)

  const port = viteConfig?.server?.port

  if (typeof port === 'number') {
    return { primary: { type: 'concrete', value: port }, fallbacks: [] }
  }
}
