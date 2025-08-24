import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import { DefineSubmodules } from './tasks'
import { actorAnalyzeAugmentation } from './features'

export default makeFacetModule({
  id: 'project',
  tasks: moduleTasks(DefineSubmodules),
  taskAugmentations: {
    'actor:analyze': {
      steps: actorAnalyzeAugmentation,
    },
  },
})
