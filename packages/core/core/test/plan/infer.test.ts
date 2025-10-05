import { describe, expect, it } from 'vitest'
import { makeWhimbrelContext } from '@src/index'
import { SOURCE__DEFINE } from '@whimbrel/source'
import { TARGET__DEFINE } from '@whimbrel/target'
import { ACTOR__ANALYZE } from '@whimbrel/actor'
import { makeTask } from '@whimbrel/core-api'
import { inferPreparationSteps } from '@src/plan/infer'

describe('inferPreparationSteps', () => {
  it('should infer define and analyze for required source actor', async () => {
    // Given
    const ctx = await makeWhimbrelContext({
      cwd: '/cwd/path',
    })
    const task = makeTask({
      id: 'dummy:dothings',
      name: 'Do Dummy Things',
      parameters: {
        actor: {
          type: 'actor',
          required: true,
          defaults: [{ ref: 'source' }],
        },
      },
    })

    // When
    const inferred = inferPreparationSteps(ctx, task)

    // Then
    expect(inferred).toEqual([
      {
        type: SOURCE__DEFINE,
        name: 'Define Source',
        bind: {
          key: 'source',
        },
        pinned: true,
        inputs: {
          source: {
            path: '/cwd/path',
          },
        },
      },
    ])
  })

  it('should infer define and analyze for required source actor', async () => {
    // Given
    const ctx = await makeWhimbrelContext({
      cwd: '/cwd/path',
    })
    const task = makeTask({
      id: 'dummy:dothings',
      name: 'Do Dummy Things',
      parameters: {
        actor: {
          type: 'actor',
          required: true,
          defaults: [{ ref: 'target' }],
        },
      },
    })

    // When
    const inferred = inferPreparationSteps(ctx, task)

    // Then
    expect(inferred).toEqual([
      {
        type: TARGET__DEFINE,
        name: 'Define Target',
        bind: {
          key: 'target',
        },
        pinned: true,
        inputs: {
          isRoot: true,
          target: {
            path: '/cwd/path',
          },
        },
      },
    ])
  })
})
