import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import { DefineSubmodules, EachSubmodule } from './tasks'
import { actorAnalyzeAugmentation, eachSubmoduleAugmentation } from './features'

export { PROJECT__EACH_SUBMODULE, PROJECT__DEFINE_SUBMODULES } from './tasks'

export default makeFacetModule({
  id: 'project',
  tasks: moduleTasks(DefineSubmodules, EachSubmodule),
  taskAugmentations: {
    'actor:analyze': {
      steps: actorAnalyzeAugmentation,
    },
    'project:each-submodule': {
      steps: eachSubmoduleAugmentation,
    },
  },
})
