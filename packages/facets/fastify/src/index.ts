import { makeFacetModule } from '@whimbrel/core-api'
import { detect } from './features'
import { queryIndex } from './query'

export default makeFacetModule({
  id: 'fastify',
  implicits: [{ facet: 'node', scope: { roles: ['engine'] } }, { facet: 'project' }],
  detect,
  queryIndex,
})
