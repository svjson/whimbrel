import { beforeAll, describe, expect, it } from 'vitest'
import { Actor, makeActor, makeWhimbrelContext, WhimbrelContext } from '@src/index'

describe('WhimbrelContext implementation', () => {
  const TEST_ACTOR__MY_ACTOR: Actor = makeActor({
    id: 'my-actor',
    name: 'MyActor',
    root: '/tmp/somewhere',
  })

  const TEST_ACTOR__OTHER_ACTOR: Actor = makeActor({
    id: 'other-actor',
    root: '/tmp/elsewhere',
  })

  const TEST_ACTOR__ROOT_ACTOR: Actor = makeActor({
    id: 'root-actor',
    root: '/tmp',
    subModules: ['my-actor', 'other-actor'],
  })

  describe('getActor', () => {
    let ctx: WhimbrelContext

    beforeAll(async () => {
      ctx = await makeWhimbrelContext({
        sources: {
          'root-actor': TEST_ACTOR__ROOT_ACTOR,
          'my-actor': TEST_ACTOR__MY_ACTOR,
          'other-actor': TEST_ACTOR__OTHER_ACTOR,
        },
      })
    })
    it('should get source actor by id', async () => {
      // When
      const result = ctx.getActor('other-actor', 'source')

      // Then
      expect(result).toBe(TEST_ACTOR__OTHER_ACTOR)
    })

    it('should get source actor by root path-filter', async () => {
      // When
      const result = ctx.getActor({ root: '/tmp/elsewhere' }, 'source')

      // Then
      expect(result).toBe(TEST_ACTOR__OTHER_ACTOR)
    })

    it('should get source actor by name-filter', async () => {
      // When
      const result = ctx.getActor({ name: 'MyActor' }, 'source')

      // Then
      expect(result).toBe(TEST_ACTOR__MY_ACTOR)
    })

    it('should get actor by name-filter, without type spec', async () => {
      // When
      const result = ctx.getActor({ name: 'MyActor' })

      // Then
      expect(result).toBe(TEST_ACTOR__MY_ACTOR)
    })

    it('should get source actor by hasSubmodule-filter, without type spec', async () => {
      // When
      const result = ctx.getActor({ hasSubmodule: 'my-actor' })

      // Then
      expect(result).toBe(TEST_ACTOR__ROOT_ACTOR)
    })
  })
})
