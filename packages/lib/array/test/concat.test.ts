import { describe, it, expect } from 'vitest'
import { concatDistinct, concatUnique } from '@src/index'

describe('Concat functions', () => {
  describe('concatDistinct', () => {
    it('should not add any values to `array` from the argument array if it already contains them', () => {
      // Given
      const array = ['a', 'b', 'c', 'd']

      // When
      concatDistinct(array, ['a', 'b'])

      // Then
      expect(array).toEqual(['a', 'b', 'c', 'd'])
    })

    it('should not add any values to `array` from any of the argument arrays if it already contains them', () => {
      // Given
      const array = ['a', 'b', 'c', 'd']

      // When
      concatDistinct(array, ['a', 'b'], ['c', 'd'])

      // Then
      expect(array).toEqual(['a', 'b', 'c', 'd'])
    })

    it('should concat two arrays if they share no values', () => {
      // Given
      const array = ['a', 'b']

      // When
      concatDistinct(array, ['c', 'd'])

      // Then
      expect(array).toEqual(['a', 'b', 'c', 'd'])
    })

    it('should concat several arrays if they share no values', () => {
      // Given
      const array = ['a', 'b']

      // When
      concatDistinct(array, ['c', 'd'], ['e', 'f'], ['g', 'h'])

      // Then
      expect(array).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'])
    })

    it('should concat several arrays but omit shared values', () => {
      // Given
      const array = ['a', 'd', 'h']

      // When
      concatDistinct(array, ['b', 'c', 'd'], ['e', 'f'], ['g', 'h'])

      // Then
      expect(array).toEqual(['a', 'd', 'h', 'b', 'c', 'e', 'f', 'g'])
    })

    it('should add no elements when the argument array is empty', () => {
      // Given
      const array = ['a', 'd', 'h']

      // When
      concatDistinct(array, [])

      // Then
      expect(array).toEqual(['a', 'd', 'h'])
    })
  })

  describe('concatUnique', () => {
    it('should not add any objects to `array` from the argument array if it already contains them', () => {
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
      concatUnique(array, [
        {
          name: 'Pelle',
          age: 74,
        },
        {
          name: 'Knutte',
          age: 15,
        },
      ])

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

    it('should not add any values to `array` from any of the argument arrays if it already contains them', () => {
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
      concatUnique(
        array,
        [
          {
            name: 'Pelle',
            age: 74,
          },
        ],
        [
          ,
          {
            name: 'Knutte',
            age: 15,
          },
        ]
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

    it('should add any supplied object that `array` does not contain', () => {
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
      concatUnique(array, [
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
        },
      ])

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
