import { makeFacetModule } from '@whimbrel/core-api'
import { queryIndex } from './query'
import { detect } from './features'

export { TurboJSON } from './adapters'
export { getTaskDependencies, readTaskTree } from './lib'

export type { TaskTree, TaskNode } from './lib'

export default makeFacetModule({
  id: 'turborepo',
  detect,
  queryIndex,
})
