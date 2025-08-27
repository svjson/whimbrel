import { describe, expect, it } from 'vitest'
import { makeTestContext } from './fixtures'
import { makeActor } from '.'
import { ContextMutator } from '.'

describe('ContextMutator', () => {
  const makeFixture = () => {
    const mutations = []
    const ctx = makeTestContext(
      {
        sources: {
          'my-actor': makeActor({ id: 'my-actor', root: '/tmp/somewhere' }),
        },
      },
      undefined,
      mutations
    )
    const mutator = new ContextMutator(ctx)

    return {
      ctx,
      mutator,
      mutations,
    }
  }

  describe('setActorProperty', () => {
    it('should set `name` and report mutation', () => {
      // Given
      const { ctx, mutator, mutations } = makeFixture()
      const actor = ctx.getActor('source', 'my-actor')

      // When
      mutator.setActorProperty(actor, 'name', 'Stig-Britt')

      // Then
      expect(actor.name).toEqual('Stig-Britt')
      expect(mutations).toEqual([
        {
          mutationType: 'ctx',
          type: 'set',
          path: 'actor:my-actor.name',
          key: 'Stig-Britt',
        },
      ])
    })
  })

  describe('addActorElement', () => {
    it('should add an element to an array member and report mutation', () => {
      // Given
      const { ctx, mutator, mutations } = makeFixture()
      const actor = ctx.getActor('source', 'my-actor')

      // When
      mutator.addActorElement(actor, 'subModules', 'spiffy-module')

      // Then
      expect(actor.subModules).toEqual(['spiffy-module'])
      expect(mutations).toEqual([
        {
          mutationType: 'ctx',
          type: 'add',
          path: 'actor:my-actor.subModules',
          key: 'spiffy-module',
        },
      ])
    })
  })

  describe('addSource', () => {
    it('should add source and report mutation', () => {
      // Given
      const { ctx, mutator, mutations } = makeFixture()
      const actor = makeActor({
        id: 'protagonist',
        root: '/tmp/elsewhere',
      })

      // When
      mutator.addSource(actor)

      // Then
      expect(ctx.sources.protagonist).toEqual(actor)
      expect(mutations).toEqual([
        {
          mutationType: 'ctx',
          type: 'add',
          path: 'sources',
          key: 'protagonist',
        },
      ])
    })
  })

  describe('addTarget', () => {
    it('should add target and report mutation', () => {
      // Given
      const { ctx, mutator, mutations } = makeFixture()
      const actor = makeActor({
        id: 'protagonist',
        root: '/tmp/elsewhere',
      })

      // When
      mutator.addTarget(actor)

      // Then
      expect(ctx.targets.protagonist).toEqual(actor)
      expect(mutations).toEqual([
        {
          mutationType: 'ctx',
          type: 'add',
          path: 'targets',
          key: 'protagonist',
        },
      ])
    })
  })
})
