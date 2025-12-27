import { makeFacetModule } from '@whimbrel/core-api'
import { detect } from './features'

export { DotEnvFile } from './adapters'

export default makeFacetModule({
  id: 'dotenv',
  detect,
})
