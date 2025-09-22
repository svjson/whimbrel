import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import { detect } from './features'
import { queryIndex } from './query'
import { MigrateWorkspaces, SetWorkspaceDependencies } from './tasks'

export {
  MigrateWorkspaces,
  SetWorkspaceDependencies,
  PNPM__MIGRATE_WORKSPACES,
  PNPM__SET_WORKSPACE_DEPENDENCIES,
} from './tasks'
export { PnpmWorkspaceYaml } from './adapters'

export default makeFacetModule({
  id: 'pnpm',
  detect,
  queryIndex,
  tasks: moduleTasks(MigrateWorkspaces, SetWorkspaceDependencies),
})
