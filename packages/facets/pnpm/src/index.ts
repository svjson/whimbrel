import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import { detect, migrateProjectAugmentation } from './features'
import { queryIndex } from './query'
import {
  MigrateProject,
  MigrateScripts,
  MigrateWorkspaces,
  SetWorkspaceDependencies,
} from './tasks'

export {
  MigrateProject,
  MigrateScripts,
  MigrateWorkspaces,
  SetWorkspaceDependencies,
  PNPM__MIGRATE_PROJECT,
  PNPM__MIGRATE_SCRIPTS,
  PNPM__MIGRATE_WORKSPACES,
  PNPM__SET_WORKSPACE_DEPENDENCIES,
} from './tasks'
export { PnpmWorkspaceYaml } from './adapters'

export default makeFacetModule({
  id: 'pnpm',
  detect,
  queryIndex,
  tasks: moduleTasks(
    MigrateProject,
    MigrateScripts,
    MigrateWorkspaces,
    SetWorkspaceDependencies
  ),
  taskAugmentations: {
    'pnpm:migrate-project': {
      steps: migrateProjectAugmentation,
    },
  },
})
