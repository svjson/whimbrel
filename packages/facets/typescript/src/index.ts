import { makeFacetModule } from '@whimbrel/core-api'
import { queryIndex } from './query'

export * from './lib'

export default makeFacetModule({
  id: 'typescript',
  queryIndex,
  implicits: [{ facet: 'tsconfig.json', scope: { roles: ['build-config'] } }, 'project'],
})
