import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import detect from './detect'

export default makeFacetModule({
  implicits: [{ facet: 'node', scope: { roles: ['engine'] } }],
  id: 'package.json',
  detect,
})
