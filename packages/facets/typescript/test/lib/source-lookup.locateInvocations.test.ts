import { describe, expect, it } from 'vitest'
import { memFsContext } from '@whimbrel-test/context-fixtures'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'

import { locateInvocations } from '@src/lib'
import { InstanceDescription } from '@whimbrel/core-api'

import {
  TYPESCRIPT__KOA__SEPARATE_FILES__DECLARE_AND_EXPORT_KOA_INSTANCE,
  TYPESCRIPT__KOA__SEPARATE_FILES__IMPORT_AND_LISTEN,
} from '@whimbrel-test/asset-fixtures'

const { createDirectory } = makeTreeFixture(DiskFileSystem)

describe('locateInvocations', () => {
  it.each([
    [
      'at file top level',
      [
        TYPESCRIPT__KOA__SEPARATE_FILES__IMPORT_AND_LISTEN,
        TYPESCRIPT__KOA__SEPARATE_FILES__DECLARE_AND_EXPORT_KOA_INSTANCE,
      ],
    ],
  ])('should locate imported object invocation %s', async (_, [indexFile, appFile]) => {
    // Given
    const ctx = await memFsContext()
    const root = await createDirectory(
      [{ 'index.ts': `@${indexFile}` }, { 'app.ts': `@${appFile}` }],
      ctx.disk
    )

    const instanceDescription: InstanceDescription = {
      type: 'class',
      name: 'Koa',
      from: {
        type: 'library',
        name: 'koa',
        importType: 'default',
      },
    }

    // When
    const invocations = await locateInvocations(ctx, [root], {
      name: 'listen',
      type: 'instance',
      instance: instanceDescription,
    })

    // Then
    expect(invocations).toHaveLength(1)
    expect(invocations[0].arguments.map((a: any) => a.value)).toEqual([4444])
  })
})
