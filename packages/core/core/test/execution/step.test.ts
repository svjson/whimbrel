import { describe, expect, it } from 'vitest'
import { matchesStepIdSelector } from '@src/index'

describe('Step ID Selectors', () => {
  describe('matchesStepIdSelector', () => {
    const testMatchesIdSelector = ({ name, match, cases }) => {
      cases.forEach(([selector, stepId]) => {
        it(name(selector, stepId), () => {
          expect(matchesStepIdSelector(selector, stepId)).toBe(match)
        })
      })
    }

    testMatchesIdSelector({
      name: (selector: string, stepId: string) =>
        `should return true for exact match of selector '${selector}' against '${stepId}`,
      match: true,
      cases: [
        [
          'todo-backend:monorepo:configure-submodules',
          'todo-backend:monorepo:configure-submodules',
        ],
        [
          '@todo/backend:package.json:set-package-name',
          '@todo/backend:package.json:set-package-name',
        ],
      ],
    })

    testMatchesIdSelector({
      name: (selector: string, stepId: string) =>
        `should return false for zero matching segment '${selector}' against '${stepId}`,
      match: false,
      cases: [
        [
          '@todo/backend:package.json:set-package-name',
          'todo-backend:monorepo:configure-submodules',
        ],
        [
          'todo-backend:monorepo:configure-submodules',
          '@todo/backend:package.json:set-package-name',
        ],
      ],
    })

    testMatchesIdSelector({
      name: (selector: string, stepId: string) =>
        `should return true for type only '${selector}' against '${stepId}`,
      match: true,
      cases: [
        ['monorepo:configure-submodules', 'todo-backend:monorepo:configure-submodules'],
        [
          'typescript:update-submodule-imports',
          '@todo/backend:typescript:update-submodule-imports',
        ],
      ],
    })

    testMatchesIdSelector({
      name: (selector: string, stepId: string) =>
        `should return false for type only match '${selector}' against '${stepId}`,
      match: false,
      cases: [
        [
          '@todo/backend:monorepo:configure-submodules',
          'todo-backend:monorepo:configure-submodules',
        ],
        [
          'todo-backend:typescript:update-submodule-imports',
          '@todo/backend:typescript:update-submodule-imports',
        ],
      ],
    })

    testMatchesIdSelector({
      name: (selector: string, stepId: string) =>
        `should return true for wildcard selector '${selector}' against '${stepId}`,
      match: true,
      cases: [
        ['monorepo:*', 'todo-backend:monorepo:configure-submodules'],
        ['*:monorepo:*', 'todo-backend:monorepo:configure-submodules'],
        ['@todo/backend:*:*', '@todo/backend:typescript:update-submodule-imports'],
      ],
    })

    testMatchesIdSelector({
      name: (selector: string, stepId: string) =>
        `should return false for non-matching wildcard selector '${selector}' against '${stepId}`,
      match: false,
      cases: [
        ['project:*', 'todo-backend:monorepo:configure-submodules'],
        ['monorepo:*:*', 'todo-backend:monorepo:configure-submodules'],
        ['@todo/backend:prettier:*', '@todo/backend:typescript:update-submodule-imports'],
      ],
    })
  })
})
