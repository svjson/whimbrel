import { describe, it, expect } from 'vitest'
import { purgeRedundant } from '@src/adapters/gitignore-adapter'

const pattern = (p: string) => {
  return {
    pattern: p,
    groups: [],
    source: '...',
  }
}

describe('purgeRedundant', () => {
  it.each([
    {
      case: 'handle empty input',
      input: [],
      expected: [],
    },
    {
      case: 'remove duplicates',
      input: [
        pattern('some-pattern'),
        pattern('some-pattern'),
        pattern('node_modules/**'),
        pattern('node_modules/**'),
      ],
      expected: [pattern('some-pattern'), pattern('node_modules/**')],
    },
    {
      case: 'remove subpaths',
      input: [
        pattern('folder/subfolder/file'),
        pattern('folder/subfolder/otherfile'),
        pattern('folder/subfolder/'),
      ],
      expected: [pattern('folder/subfolder/')],
    },
    {
      case: 'remove deeper path with different syntax',
      input: [
        pattern('node_modules'),
        pattern('.pnpm-store'),
        pattern('./node_modules/.tmp/tsconfig.build.tsbuildinfo'),
      ],
      expected: [pattern('node_modules'), pattern('.pnpm-store')],
    },
  ])('should $case', ({ input, expected }) => {
    expect(purgeRedundant(input)).toEqual(expected)
  })
})
