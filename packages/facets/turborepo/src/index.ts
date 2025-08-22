import { makeFacetModule } from '@whimbrel/core-api'
import { queryIndex } from './query'
import { detect } from './features'

export default makeFacetModule({
  id: 'turborepo',
  detect,
  queryIndex,
})
