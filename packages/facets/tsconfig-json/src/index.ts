import { makeFacetModule } from '@whimbrel/core-api'
import { detect } from './features'

export default makeFacetModule({
  id: 'tsconfig.json',
  implicits: [{ facet: 'typescript', scope: { roles: ['language'] } }],
  detect,
})
