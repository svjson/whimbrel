import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import { detect, applyLicenseAugmentation } from './features'
import { AddScript, RemoveScript, SetProperty, SetVersion } from './tasks'
import { queryIndex } from './query'

export {
  isVersion,
  parseVersion,
  updateVersion,
  updateVersionString,
  versionString,
} from './lib'

export { PackageJSON, WorkspaceAdapter } from './adapters'

export { AddScript, RemoveScript, SetProperty, SetVersion }

export default makeFacetModule({
  id: 'package.json',
  implicits: [{ facet: 'node', scope: { roles: ['engine'] } }, 'project'],
  tasks: moduleTasks(AddScript, RemoveScript, SetProperty, SetVersion),
  detect,
  taskAugmentations: {
    'license:apply': {
      steps: applyLicenseAugmentation,
    },
  },
  queryIndex,
})
