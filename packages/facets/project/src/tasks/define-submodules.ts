import { makeTask } from '@whimbrel/core-api'

export const PROJECT__DEFINE_SUBMODULES = 'project:define-submodules'

export const DefineSubmodules = makeTask({
  id: PROJECT__DEFINE_SUBMODULES,
  name: 'Define Submodules',
})

export default DefineSubmodules
