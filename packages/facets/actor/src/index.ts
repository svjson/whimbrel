import { makeFacetModule, moduleTasks } from '@whimbrel/core-api'
import {
  ACTOR__ANALYZE,
  Analyze,
  DeleteFacetArtifacts,
  DiscoverFacets,
  Reify,
} from './tasks'
import {
  actorAnalyzeAugmentation,
  sourceDefineAugmentation,
  targetDefineAugmentation,
} from './features'

export {
  Analyze,
  DiscoverFacets,
  Reify,
  ACTOR__ANALYZE,
  ACTOR__DELETE_FACET_ARTIFACTS,
  ACTOR__DISCOVER_FACETS,
  ACTOR__REIFY,
} from './tasks'

export const ActorFacet = makeFacetModule({
  id: 'actor',
  tasks: moduleTasks(Analyze, DeleteFacetArtifacts, DiscoverFacets, Reify),
  taskAugmentations: {
    'source:define': sourceDefineAugmentation,
    'target:define': targetDefineAugmentation,
    [ACTOR__ANALYZE]: actorAnalyzeAugmentation,
  },
})

export default ActorFacet
