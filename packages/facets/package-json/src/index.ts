import { makeFacetModule } from '@whimbrel/core-api'
import { detect } from './features'

export default makeFacetModule({
  id: 'package.json',
  implicits: [{ facet: 'node', scope: { roles: ['engine'] } }, 'project'],
  detect,
})
