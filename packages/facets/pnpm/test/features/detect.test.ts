import { describe, expect, it } from 'vitest'

import { memFsContext } from '@whimbrel-test/context-fixtures'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { detect } from '@src/features/detect'
import { DiskFileSystem } from '@whimbrel/filesystem'
import path from 'node:path'

const { createDirectory } = makeTreeFixture(DiskFileSystem)

describe('detect', () => {
  it('should detect pnpm if specified as packageManager in package.json', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory(
      [
        {
          'package.json': {
            packageManager: 'pnpm@10.12.3',
          },
        },
      ],
      ctx.disk
    )

    // When
    const detectionResult = await detect(ctx, root)

    // Then
    expect(detectionResult).toEqual({
      detected: true,
      facet: {
        scope: {
          roles: ['pkg-manager'],
          config: {
            version: '10.12.3',
          },
        },
      },
    })
  })

  it('should detect pnpm if specified in engines in package.json', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory(
      [
        {
          'package.json': {
            engines: {
              pnpm: '10.12.3',
            },
          },
        },
      ],
      ctx.disk
    )

    // When
    const detectionResult = await detect(ctx, root)

    // Then
    expect(detectionResult).toEqual({
      detected: true,
      facet: {
        scope: {
          roles: ['pkg-manager'],
          config: {},
        },
      },
    })
  })

  it('should detect workspace modules if present', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory(
      [
        {
          'package.json': {
            name: 'project-root',
            packageManager: 'pnpm@10.12.3',
          },
        },
        {
          'pnpm-workspace.yaml': ['packages:', ' - packages/*'],
        },
        [
          'packages',
          [
            [
              'tiny-module',
              [
                {
                  'package.json': {
                    name: '@project/tiny-module',
                  },
                },
              ],
            ],
            [
              'other-module',
              [
                {
                  'package.json': {
                    name: '@project/other-module',
                  },
                },
              ],
            ],
          ],
        ],
      ],
      ctx.disk
    )

    // When
    const detectionResult = await detect(ctx, root)

    // Then
    expect(detectionResult).toEqual({
      detected: true,
      facet: {
        scope: {
          roles: ['pkg-manager'],
          config: {
            version: '10.12.3',
            workspaceRoot: true,
          },
        },
      },
      advice: {
        facets: [
          {
            facet: 'project',
            scope: {
              config: {
                type: 'monorepo',
                subModules: [
                  {
                    name: 'tiny-module',
                    root: path.join(root, 'packages', 'tiny-module'),
                    relativeRoot: path.join('packages', 'tiny-module'),
                  },
                  {
                    name: 'other-module',
                    root: path.join(root, 'packages', 'other-module'),
                    relativeRoot: path.join('packages', 'other-module'),
                  },
                ],
              },
            },
          },
        ],
      },
    })
  })
})
