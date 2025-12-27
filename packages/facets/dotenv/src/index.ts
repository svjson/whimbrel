import { makeFacetModule } from '@whimbrel/core-api'
import { detect } from './features'

export default makeFacetModule({
  id: 'dotenv',
  detect,
})
