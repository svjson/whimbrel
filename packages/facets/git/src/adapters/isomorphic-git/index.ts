export { makeIsoMorphicGitAdapter } from './adapter'

import { repositoryRoot, commit, head, stage, readCommit, status } from './impl'

export default {
  commit,
  head,
  repositoryRoot,
  stage,
  readCommit,
  status,
}
