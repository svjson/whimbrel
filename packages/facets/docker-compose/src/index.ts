import { makeFacetModule } from '@whimbrel/core-api'
import { detect } from './features'

export { DockerComposeYamlAdapter } from './adapters'

export default makeFacetModule({
  id: 'docker-compose',
  detect,
})
