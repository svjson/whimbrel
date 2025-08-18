import { describe, it, expect } from 'vitest'

import { makeFacetScope, isValidScope, makeFacetDeclarationEntry } from '@src/index'
import { FacetScopePrototype } from '@whimbrel/core-api'

describe('Facet Scopes', () => {
  /**
   * isValidScope
   */
  describe('isValidScope()', () => {
    const validScopes = [
      ['Basic empty scope', { roles: [], config: {} }],
      [
        'Scope with resolution string value',
        { roles: [], config: {}, resolution: 'root' },
      ],
      [
        'Scope with roles and config values',
        { roles: ['engine'], config: { version: '>=20' } },
      ],
    ]

    validScopes.forEach(([desc, scope]) => {
      it(`${desc} - valid=true`, () => {
        expect(isValidScope(scope as FacetScopePrototype)).toBe(true)
      })
    })

    const invalidScopes = [
      ['Empty object', {}],
      ['undefined', undefined],
      ['null', null],
      ['Only roles key', { roles: [] }],
      ['Only config key', { config: {} }],
      ['Config is array', { roles: {}, config: [] }],
      ['Only resolution', { resolution: 'root' }],
    ]

    invalidScopes.forEach(([desc, scope]) => {
      it(`${desc} - valid=false`, () => {
        expect(isValidScope(scope as FacetScopePrototype)).toBe(false)
      })
    })
  })

  /**
   * makeFacetDeclarationEntry
   */
  describe('makeFacetScopeDeclarationEntry', () => {
    it('should create a facet-scope entry from a string', () => {
      expect(makeFacetDeclarationEntry('git')).toEqual({
        facet: 'git',
        scope: { roles: [], config: {} },
      })
    })

    it('should create a facet-scope entry from a valid facet-scope entry', () => {
      expect(
        makeFacetDeclarationEntry({
          facet: 'git',
          scope: { roles: ['version-control'], config: { branch: 'main' } },
        })
      ).toEqual({
        facet: 'git',
        scope: { roles: ['version-control'], config: { branch: 'main' } },
      })
    })

    it('should create a facet-scope entry from a facet-scope entry with partial scope', () => {
      expect(
        makeFacetDeclarationEntry({
          facet: 'git',
          scope: { roles: ['version-control'] },
        })
      ).toEqual({
        facet: 'git',
        scope: { roles: ['version-control'], config: {} },
      })
    })

    it('should create a facet-scope entry from a facet-scope entry with empty scope', () => {
      expect(
        makeFacetDeclarationEntry({
          facet: 'git',
          scope: {},
        })
      ).toEqual({
        facet: 'git',
        scope: { roles: [], config: {} },
      })
    })
  })

  /**
   * makeFacetScope
   */
  describe('makeFacetScope', () => {
    it('should create a valid scope from a valid scope object', () => {
      expect(
        makeFacetScope({
          roles: ['hamster-dancer'],
          config: { withExoticSkirt: true },
        })
      ).toEqual({
        roles: ['hamster-dancer'],
        config: { withExoticSkirt: true },
      })
    })

    it('should create a valid scope from a partial scope object', () => {
      expect(
        makeFacetScope({
          roles: ['hamster-dancer'],
        })
      ).toEqual({
        roles: ['hamster-dancer'],
        config: {},
      })
    })

    it('should create a valid scope from zero args', () => {
      expect(makeFacetScope()).toEqual({
        roles: [],
        config: {},
      })
    })

    it('should retain keys other than config and roles', () => {
      expect(
        makeFacetScope({
          resolution: 'root',
        })
      ).toEqual({
        roles: [],
        config: {},
        resolution: 'root',
      })
    })

    it('should correct null and undefined values for roles and config', () => {
      expect(
        makeFacetScope({
          roles: null,
          config: undefined,
        })
      ).toEqual({
        roles: [],
        config: {},
      })
    })
  })
})
