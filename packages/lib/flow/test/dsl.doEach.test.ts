import { describe, it, expect } from 'vitest'
import { beginFlow } from '@src/index'
import { makeWhimbrelContext } from './fixtures'

describe('Flow doEach', () => {
  describe('doEach on array', () => {
    it('should execute doEach-function for every array element', async () => {
      // Given
      const ctx = makeWhimbrelContext({})
      const computed: number[] = []

      // When
      await beginFlow(ctx)
        .let('inputs', [1, 2, 3, 4, 5])
        .doEach('inputs', (num, ns) => {
          computed.push(num * 2)
        })
        .run()

      // Then
      expect(computed).toEqual([2, 4, 6, 8, 10])
    })
  })

  describe('doEach on object/record', () => {
    it('should execute doEach-function for every array element', async () => {
      // Given
      const ctx = makeWhimbrelContext({})
      const computed: string[] = []

      // When
      await beginFlow(ctx)
        .let('inputs', { one: 1, two: 2, three: 3, four: 4, five: 5 })
        .doEach('inputs', ([key, num], ns) => {
          computed.push(`${key}*2 = ${num * 2}`)
        })
        .run()

      // Then
      expect(computed).toEqual([
        'one*2 = 2',
        'two*2 = 4',
        'three*2 = 6',
        'four*2 = 8',
        'five*2 = 10',
      ])
    })
  })
})
