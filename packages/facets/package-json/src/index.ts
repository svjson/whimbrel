import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import { detect } from './features'
import { AddScript, RemoveScript } from './tasks'

export default makeFacetModule({
  id: 'package.json',
  implicits: [{ facet: 'node', scope: { roles: ['engine'] } }, 'project'],
  tasks: moduleTasks(AddScript, RemoveScript),
  detect,
})
