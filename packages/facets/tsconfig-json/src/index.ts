import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import { detect } from './features'
import { queryIndex } from './query'
import { Clean } from './tasks'

export { TsConfigJSON } from './adapters'

export default makeFacetModule({
  id: 'tsconfig.json',
  implicits: [{ facet: 'typescript', scope: { roles: ['language'] } }, 'project'],
  tasks: moduleTasks(Clean),
  detect,
  queryIndex,
})
