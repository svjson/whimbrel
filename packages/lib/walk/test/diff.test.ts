import { describe, expect, it } from 'vitest'

import { diff, diff3Way } from '@src/index'

describe('diff', () => {
  it('should report nothing when objects are equal', () => {
    expect(
      diff(
        {
          a: 1,
          b: 2,
          c: 3,
        },
        {
          a: 1,
          b: 2,
          c: 3,
        }
      )
    ).toEqual([])
  })

  it('should report property on object as "add" when not on other', () => {
    expect(
      diff(
        {
          a: 1,
          b: 2,
          c: 3,
        },
        {
          a: 1,
          c: 3,
        }
      )
    ).toEqual([
      {
        type: 'add',
        path: ['b'],
        self: 2,
      },
    ])
  })

  it('should report property as "remove" when on other but not on object', () => {
    expect(
      diff(
        {
          a: 1,
          c: 3,
        },
        {
          a: 1,
          b: 2,
          c: 3,
        }
      )
    ).toEqual([
      {
        type: 'remove',
        path: ['b'],
        other: 2,
      },
    ])
  })

  it('should report property as "modify" when object and other have different values', () => {
    expect(
      diff(
        {
          a: 1,
          b: 2,
          c: 3,
        },
        {
          a: 1,
          b: 4,
          c: 3,
        }
      )
    ).toEqual([
      {
        type: 'modify',
        path: ['b'],
        self: 2,
        other: 4,
      },
    ])
  })
})

describe('diff3Way', () => {
  it('should report nothing when all objects are equal', () => {
    expect(
      diff3Way(
        {
          a: 1,
          b: 2,
          c: 3,
        },
        {
          a: 1,
          b: 2,
          c: 3,
        },
        {
          a: 1,
          b: 2,
          c: 3,
        }
      )
    ).toEqual([])
  })

  it('should report conflict when a, b and base have different values', () => {
    expect(
      diff3Way(
        {
          a: 1,
          b: 4,
          c: 3,
        },
        {
          a: 1,
          b: 5,
          c: 3,
        },
        {
          a: 1,
          b: 2,
          c: 3,
        }
      )
    ).toEqual([
      {
        types: ['modify', 'modify'],
        path: ['b'],
        conflict: true,
        a: 4,
        b: 5,
        base: 2,
      },
    ])
  })

  it('should report diff but no conflict when only a and base have different values', () => {
    expect(
      diff3Way(
        {
          a: 1,
          b: 4,
          c: 3,
        },
        {
          a: 1,
          b: 2,
          c: 3,
        },
        {
          a: 1,
          b: 2,
          c: 3,
        }
      )
    ).toEqual([
      {
        types: ['modify', 'unchanged'],
        path: ['b'],
        conflict: false,
        a: 4,
        b: 2,
        base: 2,
      },
    ])
  })
})
