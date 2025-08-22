import { describe, it, expect } from 'vitest'

import { DefaultFacetRegistry, detectFacets } from '@src/index'
import { WhimbrelContext, makeFacetModule } from '@whimbrel/core-api'
import { makeWhimbrelContext } from './fixtures'

describe('detectFacets', () => {
  describe('Detecting isolated facets', () => {
    it('should collect detected facets and their scopes', async () => {
      // Given
      const registry = new DefaultFacetRegistry()
      registry.register(
        makeFacetModule({
          id: 'git-dummy',
          implicits: [],
          detect: async (_ctx, _dir) => {
            return {
              detected: true,
              facet: {
                scope: {
                  roles: ['version-control'],
                },
              },
            }
          },
        })
      )
      registry.register(
        makeFacetModule({
          id: 'not-here',
          implicits: [],
        })
      )
      registry.register(
        makeFacetModule({
          id: 'fake-facet',
          implicits: [],
          detect: async (_ctx, _dir) => ({
            detected: true,
            facet: {
              scope: {
                roles: ['engine'],
                config: {
                  mainFile: 'engine.ini',
                },
              },
            },
          }),
        })
      )

      const ctx: WhimbrelContext = makeWhimbrelContext({
        facets: registry,
      })

      // When
      const result = await detectFacets(ctx, '/somewhere')

      // Then
      expect(result).toEqual({
        unknown: new Set(),
        detected: {
          'git-dummy': {
            roles: ['version-control'],
            config: {},
          },
          'fake-facet': {
            roles: ['engine'],
            config: {
              mainFile: 'engine.ini',
            },
          },
        },
      })
    })
  })

  describe('Detecting facets with implicits', () => {
    it('should pick up implicit facets with no detect function of its own', async () => {
      // Given
      const registry = new DefaultFacetRegistry([
        makeFacetModule({
          id: 'npm',
          implicits: [
            'node',
            {
              facet: 'package.json',
              scope: {
                roles: ['pkg-config'],
                config: {
                  path: '/somewhere/package.json',
                },
              },
            },
          ],
          detect: async (_ctx, _dir) => ({
            detected: true,
            facet: {
              scope: {
                roles: ['pkg-manager'],
              },
            },
          }),
        }),
        makeFacetModule({
          id: 'node',
          implicits: [],
        }),
        makeFacetModule({
          id: 'package.json',
          implicits: [],
        }),
        makeFacetModule({
          id: 'something-else',
          implicits: [],
        }),
      ])
      const ctx: WhimbrelContext = makeWhimbrelContext({
        facets: registry,
      })

      // When
      const result = await detectFacets(ctx, '/somewhere')

      // Then
      expect(result).toEqual({
        unknown: new Set(),
        detected: {
          npm: {
            roles: ['pkg-manager'],
            config: {},
          },
          node: {
            roles: [],
            config: {},
          },
          'package.json': {
            roles: ['pkg-config'],
            config: {
              path: '/somewhere/package.json',
            },
          },
        },
      })
    })

    it('should pick up implicit facets with bi-directional implicit definitions', async () => {
      // Given
      const registry = new DefaultFacetRegistry([
        makeFacetModule({
          id: 'npm',
          implicits: [
            'node',
            {
              facet: 'package.json',
              scope: {
                roles: ['pkg-config'],
                config: {
                  path: '/somewhere/package.json',
                },
              },
            },
          ],
          detect: async (_ctx, _dir) => ({
            detected: true,
            facet: {
              scope: {
                roles: ['pkg-manager'],
              },
            },
          }),
        }),
        makeFacetModule({
          id: 'node',
          implicits: ['package.json'],
        }),
        makeFacetModule({
          id: 'package.json',
          implicits: ['node'],
        }),
        makeFacetModule({
          id: 'something-else',
          implicits: [],
        }),
      ])
      const ctx: WhimbrelContext = makeWhimbrelContext({
        facets: registry,
      })

      // When
      const result = await detectFacets(ctx, '/somewhere')

      // Then
      expect(result).toEqual({
        unknown: new Set(),
        detected: {
          npm: {
            roles: ['pkg-manager'],
            config: {},
          },
          node: {
            roles: [],
            config: {},
          },
          'package.json': {
            roles: ['pkg-config'],
            config: {
              path: '/somewhere/package.json',
            },
          },
        },
      })
    })

    it('should pick up implicit and advised facets and merge scopes', async () => {
      // Given
      const registry = new DefaultFacetRegistry([
        makeFacetModule({
          id: 'npm',
          implicits: [
            {
              facet: 'node',
              scope: {
                roles: ['engine'],
              },
            },
            {
              facet: 'package.json',
              scope: {
                roles: ['pkg-config'],
                config: {
                  path: '/somewhere/package.json',
                },
              },
            },
          ],
          detect: async (_ctx, _dir) => ({
            detected: true,
            facet: {
              scope: {
                roles: ['pkg-manager'],
              },
            },
            advice: {
              facets: [
                {
                  facet: 'package.json',
                  scope: {
                    roles: ['module-configuration'],
                    config: {
                      content: {
                        packageManager: 'npm',
                      },
                    },
                  },
                },
                {
                  facet: 'node',
                  scope: {
                    roles: ['script-runner'],
                  },
                },
              ],
            },
          }),
        }),
        makeFacetModule({
          id: 'node',
          implicits: ['package.json'],
        }),
        makeFacetModule({
          id: 'package.json',
          implicits: ['node'],
          detect: async (_ctx, _dir) => ({
            detected: true,
            facet: {
              scope: {
                config: {
                  content: {
                    name: 'operation-cheesemuffin',
                    version: '0.8.2',
                  },
                },
              },
            },
          }),
        }),
        makeFacetModule({
          id: 'something-else',
          implicits: [],
        }),
      ])
      const ctx: WhimbrelContext = makeWhimbrelContext({
        facets: registry,
      })

      // When
      const result = await detectFacets(ctx, '/somewhere')

      // Then
      expect(result).toEqual({
        unknown: new Set(),
        detected: {
          npm: {
            roles: ['pkg-manager'],
            config: {},
          },
          node: {
            roles: ['engine', 'script-runner'],
            config: {},
          },
          'package.json': {
            roles: ['pkg-config', 'module-configuration'],
            config: {
              path: '/somewhere/package.json',
              content: {
                name: 'operation-cheesemuffin',
                packageManager: 'npm',
                version: '0.8.2',
              },
            },
          },
        },
      })
    })
  })
})
