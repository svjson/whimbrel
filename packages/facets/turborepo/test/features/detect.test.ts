import { describe, expect, it } from 'vitest'
import { memFsContext } from '@whimbrel-test/context-fixtures'
import { createDirectory } from '@whimbrel-test/tree-fixtures'
import { detect } from '@src/features/detect'

describe('detect', () => {
  it('should not detect turborepo when there is no package.json', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory([], ctx.disk)

    // When
    const detectionResult = await detect(ctx, root)

    // Then
    expect(detectionResult.detected).toBe(false)
  })

  it('should not detect turborepo if it is not a dependency listed in package.json', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory(
      [
        {
          'package.json': {},
        },
      ],
      ctx.disk
    )

    // When
    const detectionResult = await detect(ctx, root)

    // Then
    expect(detectionResult.detected).toBe(false)
  })

  it('should detect turborepo if it is a dependency listed in package.json', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory(
      [
        {
          'package.json': {
            dependencies: { turbo: '^2.5.6' },
          },
        },
      ],
      ctx.disk
    )

    // When
    const detectionResult = await detect(ctx, root)

    // Then
    expect(detectionResult.detected).toBe(true)
  })
})
