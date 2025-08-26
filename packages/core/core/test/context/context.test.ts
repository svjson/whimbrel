import { beforeAll, describe, expect, it } from 'vitest'
import { makeWhimbrelContext } from '.'
import { Actor, makeActor, WhimbrelContext } from '@src/index'

describe('WhimbrelContext implementation', () => {
  const TEST_ACTOR__MY_ACTOR: Actor = makeActor({
    id: 'my-actor',
    root: '/tmp/somewhere',
  })

  const TEST_ACTOR__OTHER_ACTOR: Actor = makeActor({
    id: 'other-actor',
    root: '/tmp/elsewhere',
  })

  describe('getActor', () => {
    let ctx: WhimbrelContext

    beforeAll(async () => {
      ctx = await makeWhimbrelContext({
        sources: {
          'my-actor': TEST_ACTOR__MY_ACTOR,
          'other-actor': TEST_ACTOR__OTHER_ACTOR,
        },
      })
    })
    it('should get source actor by id', async () => {
      // When
      const result = ctx.getActor('source', 'other-actor')

      // Then
      expect(result).toBe(TEST_ACTOR__OTHER_ACTOR)
    })

    it('should get source actor by root path filter', async () => {
      // When
      const result = ctx.getActor('source', { root: '/tmp/elsewhere' })

      // Then
      expect(result).toBe(TEST_ACTOR__OTHER_ACTOR)
    })
  })
})
