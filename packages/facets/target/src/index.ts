import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import { Define } from './tasks'

export { Define, TARGET__DEFINE } from './tasks'

export default makeFacetModule({
  id: 'target',
  tasks: moduleTasks(Define),
})
