import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { memFsContext } from '@whimbrel-test/context-fixtures'
import { createDirectory } from '@whimbrel-test/tree-fixtures'
import { detect } from '@src/features/detect'

describe('detect', () => {
  it('should detect npm if specified as packageManager in package.json', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory(
      [
        {
          'package.json': {
            packageManager: 'npm@10.8.2',
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

  it('should detect npm if specified in engines in package.json', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory(
      [
        {
          'package.json': {
            engines: {
              npm: '10.8.2',
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

  it('should detect npm and advise project subModulesif workspaces are defined package.json', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory(
      [
        {
          'package.json': {
            workspaces: ['core', 'packages/*'],
          },
        },
        [
          'core',
          [
            {
              'package.json': {},
            },
          ],
        ],
        [
          'packages',
          [
            [
              'calendar-lib',
              [
                {
                  'package.json': {},
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
                    name: 'core',
                    root: path.join(root, 'core'),
                    relativeRoot: 'core',
                  },
                  {
                    name: 'calendar-lib',
                    root: path.join(root, 'packages', 'calendar-lib'),
                    relativeRoot: path.join('packages', 'calendar-lib'),
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
