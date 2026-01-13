import { describe, it, expect } from 'vitest'

import { juxt, juxtCyclic, leftPad } from '@src/index'

describe('juxt', () => {
  it('juxtaposes two arrays of string of equal length', () => {
    expect(juxt(['one', 'two', 'three'], ['ein', 'zwei', 'drei'])).toEqual([
      ['one', 'ein'],
      ['two', 'zwei'],
      ['three', 'drei'],
    ])
  })

  it('juxtaposes two arrays of string of non-equal length, with left array being the longest', () => {
    expect(juxt(['one', 'two', 'three'], ['ein'])).toEqual([
      ['one', 'ein'],
      ['two', undefined],
      ['three', undefined],
    ])
  })

  it('juxtaposes two arrays of string of non-equal length, with right array being the longest', () => {
    expect(juxt(['one'], ['ein', 'zwei', 'drei'])).toEqual([
      ['one', 'ein'],
      [undefined, 'zwei'],
      [undefined, 'drei'],
    ])
  })

  it('juxtaposes two arrays of different types', () => {
    expect(juxt(['one', 'two', 'three'], [1, 2, 3])).toEqual([
      ['one', 1],
      ['two', 2],
      ['three', 3],
    ])
  })

  it('juxtaposes three arrays of different types', () => {
    expect(
      juxt(['one', 'two', 'three'], [1, 2, 3], [{ t: 'ek' }, { t: 'do' }, { t: 'teen' }])
    ).toEqual([
      ['one', 1, { t: 'ek' }],
      ['two', 2, { t: 'do' }],
      ['three', 3, { t: 'teen' }],
    ])
  })
})

})

describe('leftPad', () => {
  it('should pad the array with an additional undefined value', () => {
    // When
    const [actorId, facetId, taskId] = leftPad(['actor', 'analyze'], 3)

    // Then
    expect(actorId).toBeUndefined()
    expect(facetId).toEqual('actor')
    expect(taskId).toEqual('analyze')
  })

  it('should return the array unchanged', () => {
    // When
    const [actorId, facetId, taskId] = leftPad(['whimbrel', 'actor', 'analyze'], 3)

    // Then
    expect(actorId).toEqual('whimbrel')
    expect(facetId).toEqual('actor')
    expect(taskId).toEqual('analyze')
  })
})
