import { describe, it, expect } from 'vitest'

import { resolve } from '@src/index'

describe('value resolution', () => {
  describe('resolve', () => {
    describe('type: string', () => {
      it('should resolve a nested string from a single-resolutionPath array', () => {
        // Given
        const target = {
          name: 'test-project',
          type: 'project',
          path: '/tmp/does/not/need/to/exist/here',
          details: { pkgType: 'project' },
          meta: { name: 'Test Project A' },
        }

        // When
        const packageType = resolve('string', {}, target, ['details.pkgType'])

        // Then
        expect(packageType).toEqual('project')
      })
    })

    describe('type: path', () => {
      it('should resolve path from array construct at resolutionPath', () => {
        // Given
        const object = {
          targetPath: ['/home', 'klasse', 'place'],
        }

        // When
        const resolved = resolve('path', {}, object, 'targetPath')

        // Then
        expect(resolved).toEqual('/home/klasse/place')
      })

      it('should resolve path from array directly from array', () => {
        // Given
        const pathArray = ['/home', 'klasse', 'place']

        // When
        const resolved = resolve('path', {}, pathArray)

        // Then
        expect(resolved).toEqual('/home/klasse/place')
      })

      it('should resolve path from ref-object', () => {
        // Given
        const ctx: any = {
          options: { prop: {} },
          rootTarget: {
            root: '/home/klasse/random-things',
          },
        }
        const object = {
          targetPath: { ref: 'rootTarget.root' },
        }

        // When
        const resolved = resolve('path', ctx, object, 'targetPath')

        // Then
        expect(resolved).toEqual('/home/klasse/random-things')
      })
    })

    describe('type: object', () => {
      it('should resolve object from path', () => {
        // Given
        const object = {
          container: { of: { great: 'things', other: 'stuff' } },
        }

        // When
        const resolved = resolve('object', {}, object, 'container.of')

        // Then
        expect(resolved).toEqual({
          great: 'things',
          other: 'stuff',
        })
      })

      it('should resolve object from nested ctx ref', () => {
        // Given
        const ctx = {
          options: { prop: {} },
          source: { name: 'Here lives dog', root: '/tmp/somewhere' },
        }
        const object = {
          nested: { path: { object: { ref: 'source' } } },
        }

        // When
        const resolved = resolve('object', ctx, object, 'nested.path.object')

        // Then
        expect(resolved).toEqual({
          name: 'Here lives dog',
          root: '/tmp/somewhere',
        })
      })
    })
  })
})
