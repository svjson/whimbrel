import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { memFsContext } from '@whimbrel-test/context-fixtures'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'

import { detect } from '@src/features/detect'
import { DetectedFacet } from '@whimbrel/core-api'

const { createDirectory } = makeTreeFixture(DiskFileSystem)

describe('detect', () => {
  it('should not detect docker-compose when there is no docker-compose.yml/yaml file', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory([], ctx.disk)

    // When
    const detectionResult = await detect(ctx, root)

    // Then
    expect(detectionResult.detected).toBe(false)
  })

  it('should detect docker-compose when the docker-compose.yml exists in the target directory', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory(
      [
        {
          'docker-compose.yml': {
            services: {
              sql: {
                image: 'mcr.microsoft.com/azure-sql-edge',
              },
            },
          },
        },
      ],
      ctx.disk
    )

    // When
    const detectionResult = await detect(ctx, root)

    // Then
    expect(detectionResult.detected).toBe(true)
    expect((detectionResult as DetectedFacet).facet.scope).toEqual({
      config: {
        path: path.join(root, 'docker-compose.yml'),
        services: ['sql'],
      },
    })
  })

  it('should detect docker-compose when the docker-compose.yaml exists in the target directory', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory(
      [
        {
          'docker-compose.yaml': {
            services: {
              sql: {
                image: 'mcr.microsoft.com/azure-sql-edge',
              },
            },
          },
        },
      ],
      ctx.disk
    )

    // When
    const detectionResult = await detect(ctx, root)

    // Then
    expect(detectionResult.detected).toBe(true)
    expect((detectionResult as DetectedFacet).facet.scope).toEqual({
      config: {
        path: path.join(root, 'docker-compose.yaml'),
        services: ['sql'],
      },
    })
  })
})
