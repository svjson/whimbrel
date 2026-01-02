import { describe, expect, it } from 'vitest'

import { matchesImportSource } from '@src/lib/source-tree'

describe('matchesImportSource', () => {
  it('should match literal library name', () => {
    expect(
      matchesImportSource(
        {
          type: 'library',
          name: 'koa',
          importType: 'default',
        },
        'koa',
        '/home/ove/project-x/src/stuff'
      )
    ).toBe(true)
  })

  it('should match relative default import from same dir', () => {
    expect(
      matchesImportSource(
        {
          type: 'tree',
          name: '/project/src/app.ts',
          importType: 'default',
        },
        './app.ts',
        '/project/src'
      )
    ).toBe(true)
  })

  it('should match relative default import without .ts-extension from same dir', () => {
    expect(
      matchesImportSource(
        {
          type: 'tree',
          name: '/project/src/app.ts',
          importType: 'default',
        },
        './app',
        '/project/src'
      )
    ).toBe(true)
  })

  it('should match relative import from same dir', () => {
    expect(
      matchesImportSource(
        {
          type: 'tree',
          name: '/home/ove/project-x/src/stuff/app.ts',
          importType: 'named',
        },
        './app.ts',
        '/home/ove/project-x/src/stuff'
      )
    ).toBe(true)
  })

  it('should match relative import from parent dir', () => {
    expect(
      matchesImportSource(
        {
          type: 'tree',
          name: '/home/ove/project-x/src/stuff/app.ts',
          importType: 'named',
        },
        '../app.ts',
        '/home/ove/project-x/src/stuff/subdir'
      )
    ).toBe(true)
  })
})
