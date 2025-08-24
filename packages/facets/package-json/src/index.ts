import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import { detect } from './features'
import { AddScript } from './tasks'

export default makeFacetModule({
  id: 'package.json',
  implicits: [{ facet: 'node', scope: { roles: ['engine'] } }, 'project'],
  tasks: moduleTasks(AddScript),
  detect,
})
