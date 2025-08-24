import { describe, expect, it } from 'vitest'
import { memFsContext } from '@whimbrel-test/context-fixtures'
import { createDirectory } from '@whimbrel-test/tree-fixtures'
import { detect } from '@src/features/detect'

describe('detect', () => {
  it('should not detect package.json when there is no package.json file', async () => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory([], ctx.disk)

    // When
    const detectionResult = await detect(ctx, root)

    // Then
    expect(detectionResult.detected).toBe(false)
  })

  it('should package.json when the file exists in the target directory', async () => {
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
    expect(detectionResult.detected).toBe(true)
  })
})
