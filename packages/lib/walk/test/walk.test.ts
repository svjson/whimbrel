import { describe, it, expect } from 'vitest'

import { walk } from '@src/index'

describe('walk()', () => {
  it('should invoke onEnd for all paths ending in values', () => {
    // Given
    const object = {
      it: {
        was: {
          the: {
            best: {
              of: 'times',
            },
            worst: {
              of: 'times',
            },
          },
        },
      },
    }

    // When
    const nodes = []
    walk(object, {
      onEnd: (node) => nodes.push(node),
    })

    // Then
    expect(nodes).toEqual([
      {
        path: ['it', 'was', 'the', 'best', 'of'],
        value: 'times',
      },
      {
        path: ['it', 'was', 'the', 'worst', 'of'],
        value: 'times',
      },
    ])
  })
})
