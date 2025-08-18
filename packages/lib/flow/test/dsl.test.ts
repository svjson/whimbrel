import { describe, it, expect } from 'vitest'
import { beginFlow } from '@src/index'
import { makeWhimbrelContext } from './fixtures'

describe('Flow DSL', () => {
  describe('Declare with let', () => {
    it('should extend namespace with chained let forms', async () => {
      const ctx = makeWhimbrelContext({})
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
    })
  })
})
