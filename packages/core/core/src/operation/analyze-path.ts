import { Blueprint } from '@whimbrel/core-api'
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
          bind: {
            key: 'source',
          },
          inputs: {
            source: {
              path: targetDir,
            },
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
          bind: {
            key: 'target',
          },
          inputs: {
            target: {
              path: targetDir,
            },
            isRoot: true,
          },
        },
      ],
    }
  }
}
