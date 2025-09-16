import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import { detect } from './features'
import { Import } from './tasks'

export { parseGitMergeOutput, stage } from './adapters'

export default makeFacetModule({
  id: 'git',
  detect,
  tasks: moduleTasks(Import),
})
