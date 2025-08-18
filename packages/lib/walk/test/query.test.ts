import { describe, it, expect } from 'vitest'

import { containsAll, propertyPaths } from '@src/index'

describe('containsAll', () => {
  it('should return true if all key-value pairs match', () => {
    // Given
    const object = {
      counts: {
        cheeses: 12,
        cucumbers: 8,
        bananas: 2,
      },
    }

    // When
    const result = containsAll(object, 'counts', [
      ['cheeses', 12],
      ['cucumbers', 8],
      ['bananas', 2],
    ])

    // Then
    expect(result).toBe(true)
  })
})

describe('propertyPaths', () => {
  it('should return all top level paths - and exact copy', () => {
    // Given
    const object = {
      smoke: 'on the water',
      high: 'on fire',
      living: 'on a prayer',
    }

    // When
    const propPaths = propertyPaths(object)

    // Then
    expect(propPaths).toEqual(object)
    expect(propPaths).not.toBe(object)
  })

  it('should return the paths to all nested keys', () => {
    // Given
    const object = {
      nested: {
        summary: 'Stuck these here',
        properties: {
          smoke: 'on the water',
          high: 'on fire',
          living: 'on a prayer',
        },
      },
    }

    // When
    const propPaths = propertyPaths(object)

    // Then
    expect(propPaths).toEqual({
      'nested.summary': 'Stuck these here',
      'nested.properties.smoke': 'on the water',
      'nested.properties.high': 'on fire',
      'nested.properties.living': 'on a prayer',
    })
  })
})
