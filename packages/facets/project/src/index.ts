import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import { DefineSubmodules, EachSubmodule } from './tasks'
import {
  actorAnalyzeAugmentation,
  eachSubmoduleAugmentation,
  mergeConfig,
} from './features'

export { PROJECT__EACH_SUBMODULE, PROJECT__DEFINE_SUBMODULES } from './tasks'

export const ProjectFacet = makeFacetModule({
  id: 'project',
  tasks: moduleTasks(DefineSubmodules, EachSubmodule),
  mergeConfig: mergeConfig,
  taskAugmentations: {
    'actor:analyze': {
      steps: actorAnalyzeAugmentation,
    },
    'project:each-submodule': {
      steps: eachSubmoduleAugmentation,
    },
  },
})

export type { ProjectConfig } from './types'

export default ProjectFacet
