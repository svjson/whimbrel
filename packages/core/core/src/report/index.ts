import { WhimbrelContext } from '@whimbrel/core-api'
import { outputFacetScope } from './facet-scope'
import { outputContextFile } from './cat-file'

export { outputFacetScope } from './facet-scope'
export { outputContextFile } from './cat-file'

export const outputPostExecutionReports = async (ctx: WhimbrelContext) => {
  if (ctx.options.showFacetDetails) {
    outputFacetScope(ctx, ctx.options.showFacetDetails)
  }

  if (ctx.options.cat) {
    await outputContextFile(ctx, ctx.options.cat)
  }
}
