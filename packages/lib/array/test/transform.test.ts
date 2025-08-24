import { describe, it, expect } from 'vitest'

import { juxt } from '@src/index'

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
})
