import { ACTOR__ANALYZE, ACTOR__DISCOVER_FACETS, ACTOR__REIFY } from '@src/tasks'

/**
 * Step augmentations for actor:analyze, adding the
 * actor:discover-facets step.
 */
export const actorAnalyzeAugmentation = {
  steps: [
    {
      type: ACTOR__DISCOVER_FACETS,
    },
  ],
}

/**
 * Step augmentations for source:define, adding analyze and
 * reify steps.
 */
export const sourceDefineAugmentation = {
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
}

/**
 * Step augmentations for targget:define, adding analyze and
 * reify steps.
 */
export const targetDefineAugmentation = {
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
}
