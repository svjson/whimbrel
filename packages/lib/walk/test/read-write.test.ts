import { describe, it, expect } from 'vitest'

import { mergeLeft, readClosest, readPath, writePath } from '@src/index'

describe('writePath', () => {
  it('should write to root level property', () => {
    // Given
    const object = {
      name: 'Konny',
      age: 81,
    }

    // When
    writePath(object, 'shoe-size', 47)

    // Then
    expect(object).toEqual({
      name: 'Konny',
      age: 81,
      'shoe-size': 47,
    })
  })

  it('should write to existing root level property', () => {
    // Given
    const object = {
      name: 'Konny',
      age: 81,
      'shoe-size': 14,
    }

    // When
    writePath(object, 'shoe-size', 47)

    // Then
    expect(object).toEqual({
      name: 'Konny',
      age: 81,
      'shoe-size': 47,
    })
  })

  it('should write to nested path with existing parent', () => {
    // Given
    const object = {
      name: 'Konny',
      age: 81,
      profile: {},
    }

    // When
    writePath(object, 'profile.shoe-size', 47)

    // Then
    expect(object).toEqual({
      name: 'Konny',
      age: 81,
      profile: {
        'shoe-size': 47,
      },
    })
  })

  it('should create and write to nested path that does not exist', () => {
    // Given
    const object = {
      name: 'Konny',
      age: 81,
    }

    // When
    writePath(object, 'profile.attributes.physical.shoe-size', 47)

    // Then
    expect(object).toEqual({
      name: 'Konny',
      age: 81,
      profile: {
        attributes: {
          physical: {
            'shoe-size': 47,
          },
        },
      },
    })
  })

  it('should create and write to nested path with period in segment', () => {
    // Given
    const object = {}

    // When
    writePath(object, ['view', 'eslint@9.31.0', 'version'], '{}')

    // Then
    expect(object).toEqual({
      view: {
        'eslint@9.31.0': {
          version: '{}',
        },
      },
    })
  })
})

describe('readPath', () => {
  it('should read root level property', () => {
    // Given
    const object = {
      name: 'Konny',
      age: 81,
    }

    // When
    const name = readPath(object, 'name')

    // Then
    expect(name).toEqual('Konny')
  })

  it('should read null from non-existing root level property', () => {
    // Given
    const object = {
      name: 'Konny',
      age: 81,
    }

    // When
    const shoeSize = readPath(object, 'shoe-size')

    // Then
    expect(shoeSize).toBeUndefined()
  })

  it('should read from existing nested path', () => {
    // Given
    const object = {
      name: 'Konny',
      age: 81,
      profile: {
        'shoe-size': 47,
      },
    }

    // When
    const shoeSize = readPath(object, 'profile.shoe-size')

    // Then
    expect(shoeSize).toEqual(47)
  })

  it('read from deeply nested path', () => {
    // Given
    const object = {
      name: 'Konny',
      age: 81,
      profile: {
        attributes: {
          physical: {
            'shoe-size': 47,
          },
        },
      },
    }

    // When
    const strPathResult = readPath(object, 'profile.attributes.physical.shoe-size')
    const arrPathResult = readPath(object, [
      'profile',
      'attributes',
      'physical',
      'shoe-size',
    ])

    // Then
    expect(strPathResult).toEqual(47)
    expect(arrPathResult).toEqual(strPathResult)
  })
})

describe('readClosest', () => {
  it('should return the value at the exact path when it exists', () => {
    // Given object
    const object = { nested: { things: { here: 'value' } } }

    // When
    const strPathResult = readClosest(object, 'nested.things.here')
    const arrPathResult = readClosest(object, ['nested', 'things', 'here'])

    // Then
    expect(strPathResult).toEqual('value')
    expect(arrPathResult).toEqual('value')
  })

  it('should return the parent of a missing property', () => {
    // Given
    const object = {
      npm: {
        view: {
          stdout: '"string property"',
          stderr: '"terror error"',
        },
      },
    }

    // When
    const strPathResult = readClosest(object, 'npm.view.eslint.version')
    const arrPathResult = readClosest(object, ['npm', 'view', 'eslint', 'version'])

    // Then
    expect(strPathResult).toEqual({
      stdout: '"string property"',
      stderr: '"terror error"',
    })
    expect(arrPathResult).toEqual(strPathResult)
  })
})

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

    // Then
    expect(merged).toEqual({
      'myfile.txt': 'contains stuff!',
      'gizmo.test.js': 'contains code!',
      'cheeses.tar.gz': 'compressed cheese',
    })
  })

  it('should merge flat objects', () => {
    expect(mergeLeft({ a: 1, b: 2 }, { b: 3, c: 4 }, { c: 5, d: 6 })).toEqual({
      a: 1,
      b: 3,
      c: 5,
      d: 6,
    })
  })

  it('should ignore undefined inputs', () => {
    expect(mergeLeft({ a: 1, b: 2 }, undefined, { b: 4, c: 8 })).toEqual({
      a: 1,
      b: 4,
      c: 8,
    })
  })
})
