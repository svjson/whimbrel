import { makeFacetModule } from '@whimbrel/core-api'
import { detect } from './features'
import { queryIndex } from './query'

export default makeFacetModule({
  id: 'tsconfig.json',
  implicits: [{ facet: 'typescript', scope: { roles: ['language'] } }, 'project'],
  detect,
  queryIndex,
})
