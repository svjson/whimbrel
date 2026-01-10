import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import { detect, applyLicenseAugmentation } from './features'
import {
  AddScript,
  RemoveScript,
  RenameScript,
  ResolveConflict,
  SetProperty,
  SetVersion,
  PACKAGE_JSON__ADD_SCRIPT,
  PACKAGE_JSON__REMOVE_SCRIPT,
  PACKAGE_JSON__RENAME_SCRIPT,
  PACKAGE_JSON__RESOLVE_CONFLICT,
  PACKAGE_JSON__SET_PROPERTY,
  PACKAGE_JSON__SET_VERSION,
} from './tasks'
import { queryIndex } from './query'

export {
  isVersion,
  parseVersion,
  updateVersion,
  updateVersionString,
  resolveWorkspaces,
  versionString,
} from './lib'

export { PackageJSON, WorkspaceAdapter } from './adapters'

export {
  AddScript,
  RemoveScript,
  RenameScript,
  ResolveConflict,
  SetProperty,
  SetVersion,
  PACKAGE_JSON__ADD_SCRIPT,
  PACKAGE_JSON__REMOVE_SCRIPT,
  PACKAGE_JSON__RENAME_SCRIPT,
  PACKAGE_JSON__RESOLVE_CONFLICT,
  PACKAGE_JSON__SET_PROPERTY,
  PACKAGE_JSON__SET_VERSION,
}

export default makeFacetModule({
  id: 'package.json',
  implicits: [{ facet: 'node', scope: { roles: ['engine'] } }, 'project'],
  tasks: moduleTasks(
    AddScript,
    RemoveScript,
    RenameScript,
    ResolveConflict,
    SetProperty,
    SetVersion
  ),
  detect,
  taskAugmentations: {
    'license:apply': {
      steps: applyLicenseAugmentation,
    },
  },
  queryIndex,
})
