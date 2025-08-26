import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import { detect } from './features'
import { AddScript, RemoveScript } from './tasks'
import { queryIndex } from './query'

export { PackageJSON } from './adapters'

export { AddScript, RemoveScript }

export default makeFacetModule({
  id: 'package.json',
  implicits: [{ facet: 'node', scope: { roles: ['engine'] } }, 'project'],
  tasks: moduleTasks(AddScript, RemoveScript),
  detect,
  queryIndex,
})
