import {
  FunctionInvocationDescription,
  PositionalArgumentDescription,
  SourceLookupDescription,
  WhimbrelContext,
} from '@whimbrel/core-api'
import { lookup } from '@whimbrel/typescript'
import path from 'node:path'

const DEFINE_CONFIG_ARG = {
  type: 'positional-argument',
  position: 0,
  of: {
    type: 'function',
    name: 'defineConfig',
    from: {
      type: 'library',
      name: 'vite',
      importType: 'named',
      importName: 'defineConfig',
    },
  } satisfies FunctionInvocationDescription,
} satisfies PositionalArgumentDescription

/**
 * Locates and parses the effective Vite configuration file in the given directory
 *
 * Currently limited to parsing the dev server port property.
 *
 * @param ctx - The Whimbrel context
 * @param dir - The directory to look for the Vite configuration file
 *
 * @return The parsed Vite configuration object, or undefined if no configuration file is found
 */
export const parseViteConfiguration = async (ctx: WhimbrelContext, dir: string) => {
  const viteConfigPath = path.join(dir, 'vite.config.ts')
  if (await ctx.disk.exists(viteConfigPath)) {
    const lookupResponse = await lookup(
      ctx,
      { type: 'source-file', path: viteConfigPath },
      {
        type: 'object-path',
        path: 'server.port',
        of: {
          type: 'return-value',
          of: {
            type: 'function-declaration',
            identifiedBy: DEFINE_CONFIG_ARG,
          },
        } satisfies SourceLookupDescription,
      }
    )

    const resolutions = lookupResponse.candidates.flatMap((c) => c.resolutions)

    const [config] = resolutions
      .map((r) => {
        if (r.type === 'NumericLiteral' && r.category === 'literal') {
          return {
            server: {
              port: r.value,
            },
          }
        }
      })
      .filter(Boolean)

    return config
  }
}
