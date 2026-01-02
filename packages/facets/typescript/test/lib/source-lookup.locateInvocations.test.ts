import { describe, expect, it } from 'vitest'
import { memFsContext } from '@whimbrel-test/context-fixtures'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'

import { locateInvocations } from '@src/lib'
import { InstanceDescription } from '@whimbrel/core-api'

import {
  TYPESCRIPT__KOA__SEPARATE_FILES__DECLARE_AND_DEFAULT_EXPORT_KOA_INSTANCE,
  TYPESCRIPT__KOA__SEPARATE_FILES__DECLARE_AND_EXPORT_KOA_INSTANCE,
  TYPESCRIPT__KOA__SEPARATE_FILES__IMPORT_AND_LISTEN,
  TYPESCRIPT__KOA__SEPARATE_FILES__IMPORT_DEFAULT_AND_LISTEN,
} from '@whimbrel-test/asset-fixtures'

const { createDirectory } = makeTreeFixture(DiskFileSystem)

describe('locateInvocations', () => {
  it.each([
    [
      'on named import of exported instance derived from default import of library',
      [
        TYPESCRIPT__KOA__SEPARATE_FILES__IMPORT_AND_LISTEN,
        TYPESCRIPT__KOA__SEPARATE_FILES__DECLARE_AND_EXPORT_KOA_INSTANCE,
      ],
      {
        type: 'class',
        name: 'Koa',
        from: {
          type: 'library',
          name: 'koa',
          importType: 'default',
        },
      },
    ],
    [
      'on default import of known default export of instance',
      [
        TYPESCRIPT__KOA__SEPARATE_FILES__IMPORT_DEFAULT_AND_LISTEN,
        TYPESCRIPT__KOA__SEPARATE_FILES__DECLARE_AND_DEFAULT_EXPORT_KOA_INSTANCE,
      ],
      {
        type: 'identifier',
        from: {
          type: 'tree',
          name: './app.ts',
          importType: 'default',
        },
      },
    ],
    [
      'on default import of default exported instance derived from default import of library',
      [
        TYPESCRIPT__KOA__SEPARATE_FILES__IMPORT_DEFAULT_AND_LISTEN,
        TYPESCRIPT__KOA__SEPARATE_FILES__DECLARE_AND_DEFAULT_EXPORT_KOA_INSTANCE,
      ],
      {
        type: 'class',
        from: {
          type: 'library',
          name: 'koa',
          importType: 'default',
        },
      },
    ],
  ] as [string, [string, string], InstanceDescription][])(
    'should locate imported object invocation %s',
    async (_, [indexFile, appFile], instanceDescription) => {
      // Given
      const ctx = await memFsContext()
      const root = await createDirectory(
        [{ 'index.ts': `@${indexFile}` }, { 'app.ts': `@${appFile}` }],
        ctx.disk
      )

      // When
      const invocations = await locateInvocations(ctx, [root], {
        name: 'listen',
        type: 'instance',
        instance: instanceDescription,
      })

      // Then
      expect(invocations).toHaveLength(1)
      expect(invocations[0].arguments.map((a: any) => a.value)).toEqual([4444])
    }
  )
})
