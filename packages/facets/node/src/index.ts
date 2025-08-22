import { makeFacetModule } from '@whimbrel/core-api'
import { queryIndex } from './query'

export default makeFacetModule({
  id: 'node',
  implicits: [{ facet: 'package.json', scope: { roles: ['pkg-file'] } }, 'project'],
  queryIndex,
})
