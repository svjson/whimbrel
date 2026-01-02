import { describe, expect, it } from 'vitest'
import {
  SOURCE__KOA__IMPORT_DEFAULT_RELATIVE_AND_LISTEN,
  SOURCE__KOA__IMPORT_RELATIVE_AND_LISTEN,
  SOURCE__SINGLE_FILE_VANILLA_KOA,
} from '@test/source-fixtures'

import { findImport, sourceToAST } from '@src/lib'
import { ImportSourceDescription } from '@whimbrel/core-api'

describe('findImport', () => {
  it.each([
    [
      'default import from library',
      SOURCE__SINGLE_FILE_VANILLA_KOA,
      {
        type: 'library',
        name: 'koa',
        importType: 'default',
      },
      'Koa',
    ],
    [
      'default import from sibling in tree with relatie path',
      SOURCE__KOA__IMPORT_DEFAULT_RELATIVE_AND_LISTEN,
      {
        type: 'tree',
        name: '/project/src/app.ts',
        importType: 'default',
      },
      'app',
      '/project/src/importer.ts',
    ],
    [
      'single named import from sibling in tree',
      SOURCE__KOA__IMPORT_RELATIVE_AND_LISTEN,
      {
        type: 'tree',
        name: './app.ts',
        importType: 'named',
      },
      'app',
      './file.ts',
    ],
    [
      'single named import from sibling in tree with relative path',
      SOURCE__KOA__IMPORT_RELATIVE_AND_LISTEN,
      {
        type: 'tree',
        name: '/project/src/app.ts',
        importType: 'named',
      },
      'app',
      '/project/src/importer.ts',
    ],
  ] as [string, string, ImportSourceDescription, string, string | undefined][])(
    'should find %s',
    (_, sourceCode, importDesc, identifier, importerPath) => {
      // Given
      const ast = sourceToAST(sourceCode, importerPath)

      // When
      const result = findImport(ast, importDesc)

      // Then
      expect(result).toEqual([
        {
          type: 'ImportDeclaration',
          importType: importDesc.importType,
          name: identifier,
          node: expect.objectContaining({ type: 'ImportDeclaration' }),
          ast,
        },
      ])
    }
  )
})
