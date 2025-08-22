import { makeFacetModule } from '@whimbrel/core-api'
import { queryIndex } from './query'

export default makeFacetModule({
  id: 'node',
  implicits: ['package.json'],
  queryIndex,
})
