import { WhimbrelContext } from '@whimbrel/core-api'
import { outputFacetScope } from './facet-scope'

export { outputFacetScope } from './facet-scope'

export const outputPostExecutionReports = async (ctx: WhimbrelContext) => {
  if (ctx.options.showFacetDetails) {
    outputFacetScope(ctx, ctx.options.showFacetDetails)
  }
}
