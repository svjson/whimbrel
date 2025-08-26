import { describe, it, expect } from 'vitest'
import { ALPHA, COLLECT_UNKNOWN, enforceKeyOrder } from '@src/index'

describe('enforceKeyOrder', () => {
  it('should return the same object if keyOrder is undefined', () => {
    // Given
    const object = {
      age: 12,
      name: 'Nisse',
      id: 54,
    }

    // When
    const ordered = enforceKeyOrder(object, undefined)

    // Then
    expect(ordered).toEqual(object)
    expect(Object.keys(ordered)).toEqual(['age', 'name', 'id'])
  })

  it('should recreate the object with the specified explicit keyOrder', () => {
    // Given
    const object = {
      age: 12,
      name: 'Nisse',
      id: 54,
    }

    // When
    const ordered = enforceKeyOrder(object, ['id', 'name', 'age'])

    // Then
    expect(ordered).toEqual({
      id: 54,
      name: 'Nisse',
      age: 12,
    })
    expect(Object.keys(ordered)).toEqual(['id', 'name', 'age'])
  })

  it('should recreate the object with keys in alphabetical order', () => {
    // Given
    const object = {
      mumin: 'dal',
      fladder: 'lapp',
      klopp: 'etiklopp',
      borr: 'lämmel',
      ister: 'band',
    }

    // When
    const ordered = enforceKeyOrder(object, ALPHA)

    // Then
    expect(ordered).toEqual({
      borr: 'lämmel',
      fladder: 'lapp',
      ister: 'band',
      klopp: 'etiklopp',
      mumin: 'dal',
    })

    expect(Object.keys(ordered)).toEqual(['borr', 'fladder', 'ister', 'klopp', 'mumin'])
  })

  it('should collect unknown keys at marker entry', () => {
    // Given
    const object = {
      korv: 'stoppning',
      pelle: 'Jöns',
      name: 'Apan',
      version: '0.1.0',
      dependencies: {
        thing: '^2.8.3',
      },
    }

    // When
    const ordered = enforceKeyOrder(object, [
      'name',
      'version',
      COLLECT_UNKNOWN,
      'dependencies',
    ])

    // Then
    expect(ordered).toEqual({
      name: 'Apan',
      version: '0.1.0',
      korv: 'stoppning',
      pelle: 'Jöns',
      dependencies: {
        thing: '^2.8.3',
      },
    })
    expect(Object.keys(ordered)).toEqual([
      'name',
      'version',
      'korv',
      'pelle',
      'dependencies',
    ])
  })
})
