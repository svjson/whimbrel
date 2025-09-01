import { makeFacetModule } from '@whimbrel/core-api'
import { detect } from './features'
import { queryIndex } from './query'

export { PnpmWorkspaceYaml } from './adapters'

export default makeFacetModule({
  id: 'pnpm',
  detect,
  queryIndex,
})
