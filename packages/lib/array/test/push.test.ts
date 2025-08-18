import { describe, it, expect } from 'vitest'
import { pushDistinct, pushUnique } from '@src/index'

describe('Push functions', () => {
  describe('pushDistinct', () => {
    it('should not push value if `array` already contains it', () => {
      // Given
      const array = ['a', 'b', 'c', 'd']

      // When
      pushDistinct(array, 'a')

      // Then
      expect(array).toEqual(['a', 'b', 'c', 'd'])
    })

    it('should not push any supplied values if `array` already contains them', () => {
      // Given
      const array = ['a', 'b', 'c', 'd']

      // When
      pushDistinct(array, 'a', 'b', 'c', 'd')

      // Then
      expect(array).toEqual(['a', 'b', 'c', 'd'])
    })

    it('should not push any supplied values into `array` that it not already contains', () => {
      // Given
      const array = ['a', 'c', 'd']

      // When
      pushDistinct(array, 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h')

      // Then
      expect(array).toEqual(['a', 'c', 'd', 'b', 'e', 'f', 'g', 'h'])
    })
  })

  describe('pushUnique', () => {
    it('should not push object if `array` already contains it', () => {
      // Given
      const array = [
        {
          name: 'Knutte',
          age: 15,
        },
        {
          name: 'Pelle',
          age: 74,
        },
      ]

      // When
      pushUnique(array, {
        name: 'Pelle',
        age: 74,
      })

      // Then
      expect(array).toEqual([
        {
          name: 'Knutte',
          age: 15,
        },
        {
          name: 'Pelle',
          age: 74,
        },
      ])
    })

    it('should not push any supplied object if `array` already contains them', () => {
      // Given
      const array = [
        {
          name: 'Knutte',
          age: 15,
        },
        {
          name: 'Pelle',
          age: 74,
        },
      ]

      // When
      pushUnique(
        array,
        {
          name: 'Pelle',
          age: 74,
        },
        {
          name: 'Knutte',
          age: 15,
        }
      )

      // Then
      expect(array).toEqual([
        {
          name: 'Knutte',
          age: 15,
        },
        {
          name: 'Pelle',
          age: 74,
        },
      ])
    })

    it('should push any supplied object that `array` does not contain', () => {
      // Given
      const array = [
        {
          name: 'Knutte',
          age: 15,
        },
        {
          name: 'Pelle',
          age: 74,
        },
      ]

      // When
      pushUnique(
        array,
        {
          name: 'Pelle',
          age: 12,
        },
        {
          name: 'Knutte',
          age: 15,
        },
        {
          name: 'Ola',
          age: 50,
        }
      )

      // Then
      expect(array).toEqual([
        {
          name: 'Knutte',
          age: 15,
        },
        {
          name: 'Pelle',
          age: 74,
        },
        {
          name: 'Pelle',
          age: 12,
        },
        {
          name: 'Ola',
          age: 50,
        },
      ])
    })
  })
})
