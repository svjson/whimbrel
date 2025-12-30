import { makeFacetModule } from '@whimbrel/core-api'

export default makeFacetModule({
  id: 'typescript',
  implicits: [{ facet: 'tsconfig.json', scope: { roles: ['build-config'] } }, 'project'],
})
