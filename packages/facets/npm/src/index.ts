import { makeFacetModule } from '@whimbrel/core-api'
import { detect } from './features'
import { queryIndex } from './query'

/**
 * @whimbrel:facet npm
 */
export default makeFacetModule({
  id: 'npm',
  detect,
  queryIndex,
})
