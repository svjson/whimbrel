import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import { detect } from './features'
import { queryIndex } from './query'
import { SetWorkspaceDependencies } from './tasks'

export { SetWorkspaceDependencies, PNPM__SET_WORKSPACE_DEPENDENCIES } from './tasks'
export { PnpmWorkspaceYaml } from './adapters'

export default makeFacetModule({
  id: 'pnpm',
  detect,
  queryIndex,
  tasks: moduleTasks(SetWorkspaceDependencies),
})
