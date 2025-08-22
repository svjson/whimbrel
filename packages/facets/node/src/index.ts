import { makeFacetModule } from '@whimbrel/core-api'

export default makeFacetModule({
  id: 'node',
  implicits: ['package.json'],
})
