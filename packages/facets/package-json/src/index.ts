import { makeFacetModule } from '@whimbrel/core-api'
import detect from './detect'

export default makeFacetModule({
  id: 'package.json',
  implicits: [{ facet: 'node', scope: { roles: ['engine'] } }, 'project'],
  detect,
})
