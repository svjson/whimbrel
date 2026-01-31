import { makeFacetModule } from '@whimbrel/core-api'
import { detect } from './features'
import { queryIndex } from './query'

export default makeFacetModule({
  id: 'vite',
  implicits: [{ facet: 'node' }, { facet: 'project' }],
  detect,
  queryIndex,
})
