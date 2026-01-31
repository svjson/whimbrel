import {
  readAsset,
  TYPESCRIPT__VITE_CONFIG__REACT_SERVER_PROXY_TEST,
  TYPESCRIPT__VITE_CONFIG__REACT_SERVER_PROXY__LAMBDA,
} from '@whimbrel-test/asset-fixtures'
import { describe, it, expect } from 'vitest'
import { sourceToAST } from '@src/lib/ast'
import { lookupDescription } from '@src/lib/source-lookup'
import {
  FunctionInvocationDescription,
  SourceLookupDescription,
} from '@whimbrel/core-api'

describe('lookupDescription', () => {
  it('hehu', async () => {
    const source = await readAsset(TYPESCRIPT__VITE_CONFIG__REACT_SERVER_PROXY__LAMBDA)

    const ast = sourceToAST(source)

    lookupDescription(ast, {
      type: 'return-value',
      of: {
        type: 'function-declaration',
        identifiedBy: {
          type: 'positional-argument',
          position: 0,
          of: {
            type: 'function',
            name: 'defineConfig',
            from: {
              type: 'library',
              name: 'vite',
              importType: 'named',
              importName: 'defineConfig',
            },
          } satisfies FunctionInvocationDescription,
        },
      },
    } satisfies SourceLookupDescription)
  })
})
