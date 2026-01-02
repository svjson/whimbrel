import { describe, expect, it } from 'vitest'
import {
  SOURCE__KOA__IMPORT_DEFAULT_RELATIVE_AND_LISTEN,
  SOURCE__KOA__IMPORT_RELATIVE_AND_LISTEN,
  SOURCE__SINGLE_FILE_VANILLA_KOA,
} from '@test/source-fixtures'

import { findImportBySource, findImportedIdentifier, sourceToAST } from '@src/lib'
import { ImportSourceDescription } from '@whimbrel/core-api'
import { stripASTDetails } from './fixtures'

describe('findImportedIdentifier', () => {
  const importStatements = [
    "import Koa from 'koa'",
    "import app from '/app.ts'",
    "import { logger } from './logger'",
    "import { findNodes, deleteNode, updateNode } from '../../nodes'",
    "import { reset } from '@src/state'",
  ].join('\n')

  it.each([
    ['default import from library', { identifier: 'Koa', importType: 'default' }],
    ['default import from relative file', { identifier: 'app', importType: 'default' }],
    [
      'single named import from relative file',
      { identifier: 'logger', importType: 'named' },
    ],
    [
      'first entry in named relative import',
      { identifier: 'findNodes', importType: 'named' },
    ],
    [
      'middle entry in named relative import',
      { identifier: 'deleteNode', importType: 'named' },
    ],
    [
      'last entry in named relative import',
      { identifier: 'updateNode', importType: 'named' },
    ],
    ['named import from path alias import', { identifier: 'reset', importType: 'named' }],
  ])('should find %s', (_, { identifier, importType }) => {
    // Given
    const ast = sourceToAST(importStatements)

    // When
    const result = findImportedIdentifier(ast, identifier)

    // Then
    expect(stripASTDetails(result)).toEqual({
      name: identifier,
      importType,
    })
  })
})
