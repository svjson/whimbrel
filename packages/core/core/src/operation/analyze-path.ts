import { Blueprint } from '@whimbrel/core-api'
import { ACTOR__ANALYZE } from '@whimbrel/actor'
import { SOURCE__DEFINE } from '@whimbrel/source'

/**
 * Construct a Whimbrel Plan Scaffold for analyzing the contents of
 * of directory path.
 */
export const makeAnalyzeScaffold = (targetDir: string): Blueprint => {
  return {
    steps: [
      {
        type: SOURCE__DEFINE,
        name: 'Define source',
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
}
