import { FacetModule, FacetRegistry, makeFacetModule } from '@whimbrel/core-api'
import { describe, expect, it } from 'vitest'
import { DefaultFacetRegistry } from '@src/index'

const DUMMY_FACET: FacetModule = makeFacetModule({
  id: 'dummy',
  implicits: [],
})
const FAKE_FACET: FacetModule = makeFacetModule({
  id: 'fake',
  implicits: [],
})

describe('DefaultFacetRegistry', () => {
  describe('construction', () => {
    it('should register facets in array given to constructor', () => {
      // When
      const registry = new DefaultFacetRegistry([DUMMY_FACET, FAKE_FACET])

      // Then
      expect(registry.all()).toEqual([DUMMY_FACET, FAKE_FACET])
    })
  })

  describe('register and get', () => {
    it('should return registered facet by id', () => {
      // Given
      const registry: FacetRegistry = new DefaultFacetRegistry()
      registry.register(DUMMY_FACET)
      registry.register(FAKE_FACET)

      // When
      const dummy = registry.get('dummy')
      const fake = registry.get('fake')

      // Then
      expect(dummy).toBe(DUMMY_FACET)
      expect(fake).toBe(FAKE_FACET)
    })

    it('should return registered facets', () => {
      // Given
      const registry: FacetRegistry = new DefaultFacetRegistry()
      registry.register(DUMMY_FACET)
      registry.register(FAKE_FACET)

      // When
      const all = registry.all()

      // Then
      expect(all).toEqual([DUMMY_FACET, FAKE_FACET])
    })
  })
})
