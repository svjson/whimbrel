import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import { ACTOR__ANALYZE, ACTOR__DISCOVER_FACETS, Analyze, DiscoverFacets } from './tasks'
export { Analyze, DiscoverFacets, ACTOR__ANALYZE, ACTOR__DISCOVER_FACETS } from './tasks'

export const ActorFacet = makeFacetModule({
  id: 'actor',
  tasks: moduleTasks(Analyze, DiscoverFacets),
  taskAugmentations: {
    'source:define': {
      steps: [
        {
          type: ACTOR__ANALYZE,
          pinned: true,
          inputs: {
            actor: { ref: 'source' },
          },
        },
      ],
    },
    'target:define': {
      steps: [
        {
          type: ACTOR__ANALYZE,
          pinned: true,
          inputs: {
            actor: { ref: 'target' },
          },
        },
      ],
    },
    [ACTOR__ANALYZE]: {
      steps: [
        {
          type: ACTOR__DISCOVER_FACETS,
        },
      ],
    },
  },
})

export default ActorFacet
