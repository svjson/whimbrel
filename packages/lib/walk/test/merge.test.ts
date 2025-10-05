import { describe, it, expect } from 'vitest'

import { mergeLeft } from '@src/index'

describe('mergeLeft', () => {
  it('should deep-merge objects', () => {
    // Given
    const a = {
      it: {
        was: {
          the: {
            best: {
              of: 'times',
            },
          },
        },
      },
    }

    const b = {
      it: {
        was: {
          the: {
            worst: {
              of: 'times',
            },
          },
        },
      },
    }

    // When
    const merged = mergeLeft({}, a, b)
    const mergedWithOptions = mergeLeft({}, { sources: [a, b] })

    // Then
    expect(merged).toEqual({
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
    })
    expect(mergedWithOptions).toEqual(merged)
  })

  it('should respect keys with periods', () => {
    const a = {
      'myfile.txt': 'contains stuff!',
      'gizmo.test.js': 'contains code!',
    }

    const b = {
      'cheeses.tar.gz': 'compressed cheese',
    }

    // When
    const merged = mergeLeft({}, a, b)
    const mergedWithOptions = mergeLeft({}, { sources: [a, b] })

    // Then
    expect(merged).toEqual({
      'myfile.txt': 'contains stuff!',
      'gizmo.test.js': 'contains code!',
      'cheeses.tar.gz': 'compressed cheese',
    })
    expect(mergedWithOptions).toEqual(merged)
  })

  it('should merge flat objects', () => {
    expect(mergeLeft({ a: 1, b: 2 }, { b: 3, c: 4 }, { c: 5, d: 6 })).toEqual({
      a: 1,
      b: 3,
      c: 5,
      d: 6,
    })
    expect(
      mergeLeft(
        { a: 1, b: 2 },
        {
          sources: [
            { b: 3, c: 4 },
            { c: 5, d: 6 },
          ],
        }
      )
    ).toEqual({
      a: 1,
      b: 3,
      c: 5,
      d: 6,
    })
  })

  it('should retain empty object in first/target argument', () => {
    expect(mergeLeft({ style: {} }, { propertyA: true })).toEqual({
      style: {},
      propertyA: true,
    })
  })

  it('should retain empty object in second argument', () => {
    expect(mergeLeft({}, { style: {} })).toEqual({
      style: {},
    })
  })

  it('should merge empty object onto empty object', () => {
    expect(mergeLeft({}, {})).toEqual({})
  })

  it('should ignore undefined inputs', () => {
    // Given
    const a = { a: 1, b: 2 }
    const b = { b: 4, c: 8 }

    // When
    const merged = mergeLeft(a, undefined, b)

    // Then
    expect(merged).toEqual({
      a: 1,
      b: 4,
      c: 8,
    })
    expect(Object.keys(merged)).toEqual(['a', 'b', 'c'])
  })

  it('should overwrite with undefined values by default', () => {
    expect(mergeLeft({}, { source: 'whimbrel' }, { source: undefined })).toEqual({
      source: undefined,
    })
  })

  it('should not overwrite with undefined with ignoreUndefined=true', () => {
    expect(
      mergeLeft(
        {},
        {
          sources: [{ source: 'whimbrel' }, { source: undefined }],
          ignoreUndefined: true,
        }
      )
    ).toEqual({
      source: 'whimbrel',
    })
  })
})
