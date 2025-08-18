import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import { Define } from './tasks'

export { Define, SOURCE__DEFINE } from './tasks'

export default makeFacetModule({
  id: 'source',
  tasks: moduleTasks(Define),
})
