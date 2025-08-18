import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import { ACTOR__ANALYZE, ACTOR__DISCOVER_FACETS, Analyze, DiscoverFacets } from './tasks'
export { Analyze, DiscoverFacets, ACTOR__ANALYZE, ACTOR__DISCOVER_FACETS } from './tasks'

export default makeFacetModule({
  id: 'actor',
  tasks: moduleTasks(Analyze, DiscoverFacets),
  taskAugmentations: {
    [ACTOR__ANALYZE]: {
      steps: [
        {
          type: ACTOR__DISCOVER_FACETS,
        },
      ],
    },
  },
})
