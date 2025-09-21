import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import { detect } from './features'
import { Import } from './tasks'

export { Import, GIT__IMPORT } from './tasks'

export { parseGitMergeOutput, makeGitAdapter, makeIsoMorphicGitAdapter } from './adapters'

export { default as isomorphicGit } from './adapters/isomorphic-git'

export default makeFacetModule({
  id: 'git',
  detect,
  tasks: moduleTasks(Import),
})
