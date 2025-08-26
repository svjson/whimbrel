import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import {
  ACTOR__ANALYZE,
  ACTOR__DISCOVER_FACETS,
  ACTOR__REIFY,
  Analyze,
  DiscoverFacets,
  Reify,
} from './tasks'
export {
  Analyze,
  DiscoverFacets,
  Reify,
  ACTOR__ANALYZE,
  ACTOR__DISCOVER_FACETS,
  ACTOR__REIFY,
} from './tasks'

export const ActorFacet = makeFacetModule({
  id: 'actor',
  tasks: moduleTasks(Analyze, DiscoverFacets, Reify),
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
        {
          type: ACTOR__REIFY,
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
        {
          type: ACTOR__REIFY,
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
