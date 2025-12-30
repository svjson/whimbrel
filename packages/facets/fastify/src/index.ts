import { makeFacetModule } from '@whimbrel/core-api'
import { detect } from './features'

export default makeFacetModule({
  id: 'fastify',
  implicits: [{ facet: 'node', scope: { roles: ['engine'] } }, { facet: 'project' }],
  detect,
})
