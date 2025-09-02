import path from 'node:path'

import { memFsContext } from '@whimbrel-test/context-fixtures'
import { describe, expect, it, test } from 'vitest'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'
import { TsConfigJSON } from '@src/index'

const { createDirectory } = makeTreeFixture(DiskFileSystem)

describe('TsConfigJSON', () => {
  describe('read', () => {
    it('can read default file name tsconfig.json from dir argument', async () => {
      // Given
      const ctx = await memFsContext()
      const root = await createDirectory(
        [
          {
            'tsconfig.json': {
              compilerOptions: {
                module: 'ESNext',
              },
            },
          },
        ],
        ctx.disk
      )

      // When
      const tsConfig = await TsConfigJSON.read(ctx.disk, root)

      // Then
      expect(tsConfig).toBeDefined()
    })

    it('can read specified filename tsconfig.base.json', async () => {
      // Given
      const ctx = await memFsContext()
      const root = await createDirectory(
        [
          {
            'tsconfig.base.json': {
              compilerOptions: {
                module: 'ESNext',
              },
            },
          },
        ],
        ctx.disk
      )

      // When
      const tsConfig = await TsConfigJSON.read(ctx.disk, [root, 'tsconfig.base.json'])

      // Then
      expect(tsConfig).toBeDefined()
    })
  })

  describe('hasRelativeParent', () => {
    test.each([
      ['../../tsconfig.json', true],
      ['../tsconfig.json', true],
      ['./tsconfig.json', true],
      ['./tsconfig.base.json', true],
      ['@tsconfig/node20/tsconfig.json', false],
      ['@tsconfig/recommended/tsconfig.json', false],
      [undefined, false],
    ])(`"%s" should test %b`, async (extendsValue, expected) => {
      // Given
      const tsConfigJson = new TsConfigJSON({
        content: {
          ...(extendsValue
            ? {
                extends: extendsValue,
              }
            : {}),
        },
      })

      // Then
      expect(tsConfigJson.hasRelativeParent()).toBe(expected)
    })
  })

  describe('readHierarchy', () => {
    it('should read only the target file when there is no "extends" property', async () => {
      // Given
      const ctx = await memFsContext()
      const root = await createDirectory(
        [
          {
            'tsconfig.json': {
              compilerOptions: {
                module: 'ESNext',
              },
            },
          },
        ],
        ctx.disk
      )

      // When
      const hierarchy = await TsConfigJSON.readHierarchy(ctx.disk, root)

      // Then
      expect(hierarchy.map((tsConfig) => tsConfig.get('compilerOptions'))).toEqual([
        {
          module: 'ESNext',
        },
      ])
    })

    it('should read local tsconfig and parent directory tsconfig', async () => {
      // Given
      const ctx = await memFsContext()
      const root = await createDirectory(
        [
          {
            'tsconfig.base.json': {
              excludes: ['**/build'],
            },
          },
          [
            'packages',
            [
              [
                'module',
                [
                  {
                    'tsconfig.build.json': {
                      extends: './tsconfig.json',
                      compilerOptions: {
                        module: 'ESNext',
                      },
                    },
                  },
                  {
                    'tsconfig.json': {
                      extends: '../../tsconfig.base.json',
                      compilerOptions: 'NodeNext',
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
      const hierarchy = await TsConfigJSON.readHierarchy(ctx.disk, [
        root,
        'packages',
        'module',
        'tsconfig.build.json',
      ])

      // Then
      expect(hierarchy).toBeDefined()
      expect(hierarchy.map((tsConfig) => tsConfig.getPath())).toEqual([
        path.join(root, 'tsconfig.base.json'),
        path.join(root, 'packages', 'module', 'tsconfig.json'),
        path.join(root, 'packages', 'module', 'tsconfig.build.json'),
      ])
    })
  })

  describe('removeValuesInheritedFrom', () => {
    it('should remove duplicated context-insensitive compilerOptions', () => {
      // Given
      const parent = new TsConfigJSON({
        content: {
          compilerOptions: {
            module: 'NodeNext',
            moduleResolution: 'NodeNext',
            esModuleInterop: true,
            lib: ['Node'],
            skipLibCheck: true,
            allowImportingTsExtensions: true,
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            jsx: 'react-jsx',
            strict: true,
            noPropertyAccessFromIndexSignature: false,
          },
        },
      })

      const child = new TsConfigJSON({
        content: {
          compilerOptions: {
            module: 'ESNext',
            moduleResolution: 'NodeNext',
            esModuleInterop: true,
            lib: ['Node'],
            skipLibCheck: true,
            allowImportingTsExtensions: false,
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            jsx: 'react-jsx',
            strict: true,
            noPropertyAccessFromIndexSignature: false,
          },
        },
      })

      // When
      child.removeValuesInheritedFrom(parent)

      // Then
      expect(child.get('compilerOptions')).toEqual({
        module: 'ESNext',
        allowImportingTsExtensions: false,
      })
    })
  })
})
