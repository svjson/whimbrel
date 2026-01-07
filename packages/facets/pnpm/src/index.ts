import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import {
  detect,
  migrateProjectAugmentation,
  migrateSubmoduleAugmentation,
} from './features'
import { queryIndex } from './query'
import {
  MigrateProject,
  MigrateScripts,
  MigrateSubmodule,
  MigrateWorkspaces,
  PNPM__MIGRATE_PROJECT,
  PNPM__MIGRATE_SUBMODULE,
  SetWorkspaceDependencies,
} from './tasks'

export {
  MigrateProject,
  MigrateScripts,
  MigrateWorkspaces,
  SetWorkspaceDependencies,
  PNPM__MIGRATE_PROJECT,
  PNPM__MIGRATE_SCRIPTS,
  PNPM__MIGRATE_SUBMODULE,
  PNPM__MIGRATE_WORKSPACES,
  PNPM__SET_WORKSPACE_DEPENDENCIES,
} from './tasks'
export { PnpmWorkspaceYaml } from './adapters'

/**
 * @whimbrel:facet pnpm
 */
export default makeFacetModule({
  id: 'pnpm',
  detect,
  queryIndex,
  tasks: moduleTasks(
    MigrateProject,
    MigrateScripts,
    MigrateSubmodule,
    MigrateWorkspaces,
    SetWorkspaceDependencies
  ),
  taskAugmentations: {
    [PNPM__MIGRATE_PROJECT]: {
      steps: migrateProjectAugmentation,
    },
    [PNPM__MIGRATE_SUBMODULE]: {
      steps: migrateSubmoduleAugmentation,
    },
  },
})
