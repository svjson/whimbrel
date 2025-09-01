import path from 'node:path'

import { WhimbrelContext } from '@whimbrel/core-api'

const evaluateGlob = async (
  ctx: WhimbrelContext,
  glob: string,
  root: string
): Promise<string[]> => {
  let depth = 0
  if (glob.endsWith('/*')) {
    depth = 1
  } else if (glob.endsWith('/**')) {
    depth = undefined
  }

  const scanRoot =
    typeof depth === 'number'
      ? glob
          .split('/')
          .filter((p) => !p.includes('*'))
          .join('/')
      : glob

  const pkgJsonPaths = await ctx.disk.scanDir(path.join(root, scanRoot), {
    depth,
    filter: (e) => path.basename(e.path) === 'package.json',
    ignorePredicate: (e) => ['node_modules', '.git'].includes(path.basename(e.path)),
  })

  return pkgJsonPaths.map((e) => path.dirname(e.path))
}

export const resolveWorkspaces = async (
  ctx: WhimbrelContext,
  workspaces: string[],
  root: string
) => {
  const result: string[] = []
  for (const workspaceEntry of workspaces) {
    result.push(...(await evaluateGlob(ctx, workspaceEntry, root)))
  }

  return result
}
