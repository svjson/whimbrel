import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { memFsContext } from '@whimbrel-test/context-fixtures'
import makeTreeFixture, { asset } from '@whimbrel-test/tree-fixtures'
import { SourceFolder } from '@whimbrel/core-api'
import { DiskFileSystem } from '@whimbrel/filesystem'

import { querySourceFolders } from '@src/query/project.source-folders'

const { createDirectory } = makeTreeFixture(DiskFileSystem)

import {
  TSCONFIG_JSON__VANILLA,
  TSCONFIG_JSON__SRC_AND_TEST,
} from '@whimbrel-test/asset-fixtures'
import { makeActor } from '@whimbrel/core-api'

describe('project:source-folders', () => {
  it.each([
    [
      'single rootDir="src"',
      TSCONFIG_JSON__VANILLA,
      [
        {
          type: 'source',
          name: 'src',
          relative: 'src',
          absolute: '<transient>',
        },
      ],
    ],
    [
      'rootDirs=["src", "test"]',
      TSCONFIG_JSON__SRC_AND_TEST,
      [
        {
          type: 'source',
          name: 'src',
          relative: 'src',
          absolute: '<transient>',
        },
        {
          type: 'test',
          name: 'test',
          relative: 'test',
          absolute: '<transient>',
        },
      ],
    ],
  ] as [string, string, SourceFolder[]][])(
    'should respond declared directories of tsconfig.json with %s',
    async (_, tsconfig, expectedResult) => {
      // Given
      const ctx = await memFsContext()
      const root = await createDirectory([{ 'tsconfig.json': asset(tsconfig) }], ctx.disk)
      ctx.sources['my-project'] = makeActor({
        id: 'my-project',
        root,
      })

      // When
      const result = await querySourceFolders(ctx, {
        type: 'project:source-folders',
        actor: ctx.sources['my-project'],
      })

      // Then
      expect(result).toEqual(
        expectedResult.map((r) => ({
          ...r,
          absolute: path.join(root, r.relative),
        }))
      )
    }
  )
})
