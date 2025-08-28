import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import { detect } from './features'
import { AddScript, RemoveScript, SetVersion } from './tasks'
import { queryIndex } from './query'

export {
  isVersion,
  parseVersion,
  updateVersion,
  updateVersionString,
  versionString,
} from './lib'

export { PackageJSON, WorkspaceAdapter } from './adapters'

export { AddScript, RemoveScript, SetVersion }

export default makeFacetModule({
  id: 'package.json',
  implicits: [{ facet: 'node', scope: { roles: ['engine'] } }, 'project'],
  tasks: moduleTasks(AddScript, RemoveScript, SetVersion),
  detect,
  queryIndex,
})
