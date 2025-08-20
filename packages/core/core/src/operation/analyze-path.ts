import { Blueprint } from '@whimbrel/core-api'
import { ACTOR__ANALYZE } from '@whimbrel/actor'
import { SOURCE__DEFINE } from '@whimbrel/source'
import { TARGET__DEFINE } from '@whimbrel/target'

/**
 * Construct a Whimbrel Plan Scaffold for analyzing the contents of
 * of directory path.
 */
export const makeAnalyzeScaffold = (
  targetDir: string,
  actorType: string = 'source'
): Blueprint => {
  if (actorType === 'source') {
    return {
      steps: [
        {
          type: SOURCE__DEFINE,
          name: 'Define Source',
          pinned: true,
          inputs: {
            source: {
              path: targetDir,
            },
          },
        },
        {
          type: ACTOR__ANALYZE,
          name: 'Analyze',
          pinned: true,
          inputs: {
            actor: { ref: 'source' },
          },
        },
      ],
    }
  } else {
    return {
      steps: [
        {
          type: TARGET__DEFINE,
          name: 'Define Target',
          pinned: true,
          inputs: {
            target: {
              path: targetDir,
            },
          },
        },
        {
          type: ACTOR__ANALYZE,
          name: 'Analyze',
          pinned: true,
          inputs: {
            actor: { ref: 'target' },
          },
        },
      ],
    }
  }
}
