import { describe, it, expect } from 'vitest'
import { makeWhimbrelContext } from './fixtures'
import { DefaultFacetRegistry } from '@src/index'
import { Actor, FacetQueryResult, makeActor, makeFacetModule } from '@whimbrel/core-api'
import { makeFacetScope, pickRankedResult, queryFacets } from '@src/index'

describe('queryFacets', () => {
  const NoQueryIndexFacet = makeFacetModule({
    id: 'no-query-index-facet',
  })
  const DummyNode = makeFacetModule({
    id: 'node',
    queryIndex: {
      'version-control:ignore-files': async (_ctx, _query) => {
        return [{ pattern: 'node_modules', groups: ['generated'], source: 'node' }]
      },
    },
  })
  const DummyTsConfig = makeFacetModule({
    id: 'tsconfig.json',
    queryIndex: {
      'version-control:ignore-files': async (_ctx, _query) => {
        return [{ pattern: 'dist/', groups: ['build'], source: 'tsconfig.json' }]
      },
    },
  })
  const DummyVite = makeFacetModule({
    id: 'vite',
    queryIndex: {
      'version-control:ignore-files': async (_ctx, _query) => {},
    },
  })

  it('should return an empty array when there are no results', async () => {
    // Given
    const ctx = makeWhimbrelContext({
      facets: new DefaultFacetRegistry([NoQueryIndexFacet]),
    })
    const actor: Actor = makeActor({
      id: 'monkey-business',
      name: 'Monkey Business',
      root: '/tmp/somewhere',
      facets: {
        'no-query-index-facet': makeFacetScope({}),
      },
    })

    // When
    const queryResult = await queryFacets(ctx, actor, {
      type: 'version-control:ignore-files',
    })

    // Then
    expect(queryResult).toEqual([])
  })

  it('should return the query results from each facet that yields a result', async () => {
    // Given
    const ctx = makeWhimbrelContext({
      facets: new DefaultFacetRegistry([
        NoQueryIndexFacet,
        DummyNode,
        DummyVite,
        DummyTsConfig,
      ]),
    })
    const actor: Actor = makeActor({
      id: 'monkey-business',
      name: 'Monkey Business',
      root: '/tmp/somewhere',
      facets: {
        'no-query-index-facet': makeFacetScope({}),
        node: makeFacetScope({}),
        'tsconfig.json': makeFacetScope({}),
        vite: makeFacetScope({}),
      },
    })
    // When
    const queryResult = await queryFacets(ctx, actor, {
      type: 'version-control:ignore-files',
    })

    // Then
    expect(queryResult).toEqual([
      {
        source: 'node',
        result: [{ pattern: 'node_modules', groups: ['generated'], source: 'node' }],
      },
      {
        source: 'tsconfig.json',
        result: [{ pattern: 'dist/', groups: ['build'], source: 'tsconfig.json' }],
      },
    ])
  })
})

describe('pickRankedResult', () => {
  it('should pick the result from the first source/ranking match', () => {
    // Given
    const actor: Actor = makeActor({
      id: 'my-actor',
      name: 'Actor Actorsson',
      root: '/tmp/somwhere',
      facets: {
        npm: makeFacetScope({ roles: ['pkg-manager'] }),
        'package.json': makeFacetScope({ roles: ['pkg-file'] }),
        git: makeFacetScope({ roles: ['vcs'] }),
      },
    })

    const queryResult: FacetQueryResult[] = [
      {
        source: 'git',
        result: { name: 'my-project' },
      },
      {
        source: 'package.json',
        result: { name: '@me/my-spiffy-project' },
      },
      {
        source: 'npm',
        result: { name: 'yawn, I should not even have responded...' },
      },
    ]

    // When
    const picked = pickRankedResult(actor, queryResult, [{ role: 'pkg-file' }])

    // Then
    expect(picked).toEqual({
      name: '@me/my-spiffy-project',
    })
  })
})
