import { describe, it, expect } from 'vitest'
import { beginFlow } from '@src/index'
import { makeWhimbrelContext } from './fixtures'
import { JournalEntry } from '@whimbrel/core-api'

describe('Flow DSL', () => {
  describe('Declare with let', () => {
    it('should extend namespace with chained let forms', async () => {
      // Given
      const journal: JournalEntry[] = []
      const ctx = makeWhimbrelContext({}, journal)
      let myVarValue: string

      // When
      await beginFlow(ctx)
        .let('myVar', 'Value for Let-Money!')
        .do(({ myVar }) => {
          myVarValue = myVar
        })
        .run()

      // Then
      expect(myVarValue).toEqual('Value for Let-Money!')
      expect(journal).toEqual([
        {
          origin: 'flow',
          type: 'let',
          payload: {
            name: 'myVar',
            value: 'Value for Let-Money!',
          },
        } satisfies JournalEntry,
      ])
    })

    it('should use provided formatter for journalling', async () => {
      // Given
      const journal: JournalEntry[] = []
      const ctx = makeWhimbrelContext({}, journal)

      // When
      await beginFlow(ctx)
        .let('myVar', 'BIG VALUE', {
          journal: ({ value }) => ({ name: 'my_var', value: value.toLowerCase() }),
        })
        .run()

      // Then
      expect(journal).toEqual([
        {
          origin: 'flow',
          type: 'let',
          payload: {
            name: 'my_var',
            value: 'big value',
          },
        },
      ])
    })

    it('should accept and use journal formatter as options argument', async () => {
      // Given
      const journal: JournalEntry[] = []
      const ctx = makeWhimbrelContext({}, journal)

      // When
      await beginFlow(ctx)
        .let('myVar', 'BIG VALUE', ({ value }) => ({
          name: 'my_var',
          value: value.toLowerCase(),
        }))
        .run()

      // Then
      expect(journal).toEqual([
        {
          origin: 'flow',
          type: 'let',
          payload: {
            name: 'my_var',
            value: 'big value',
          },
        },
      ])
    })
  })
})
