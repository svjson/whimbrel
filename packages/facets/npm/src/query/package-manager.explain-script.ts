import {
  Actor,
  ExplainScriptCriteria,
  FacetQueryFunction,
  WhimbrelContext,
} from '@whimbrel/core-api'
import { PackageJSON } from '@whimbrel/package-json'
import { makeShellParser } from '@whimbrel/script-parser'
import { collectIntent, decorateScript, summarizeScript } from '@src/lib'
import {} from '@src/lib/script'

/**
 * Retrieve the script content based on the provided criteria.
 */
const getScriptContent = async (
  ctx: WhimbrelContext,
  actor: Actor,
  criteria: ExplainScriptCriteria
): Promise<string | undefined> => {
  if ('scriptId' in criteria) {
    const pkgJson = await PackageJSON.readIfExists(ctx.disk, actor.root)
    if (pkgJson) {
      return pkgJson.getScript(criteria.scriptId)
    }
  } else if ('scriptContent' in criteria) {
    return criteria.scriptContent
  }
}

/**
 * Query-implementation of `package-manager:explain-script`
 */
export const queryExplainScript: FacetQueryFunction<
  'package-manager:explain-script'
> = async (ctx: WhimbrelContext, { actor, criteria }) => {
  const scriptContent = await getScriptContent(ctx, actor, criteria)

  if (!scriptContent) return

  const scriptParser = makeShellParser()

  const scriptIR = scriptParser.parse(scriptContent)

  await decorateScript(scriptIR)

  return {
    description: {
      summary: summarizeScript(scriptIR),
      intent: collectIntent(scriptIR),
    },
    script: scriptIR,
  }
}
