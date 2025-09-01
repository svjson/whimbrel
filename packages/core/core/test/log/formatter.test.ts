import { newStepResult } from '@whimbrel/core-api'
import { describe, expect, it } from 'vitest'
import { makeWhimbrelContext, DefaultFormatter } from '@src/index'

describe('DefaultFormatter', () => {
  describe('formatStepResult', () => {
    it('should return an empty string when given an empty stepResult', async () => {
      // Given
      const ctx = await makeWhimbrelContext({})
      const formatter = new DefaultFormatter(ctx)
      const stepResult = newStepResult()

      // When
      const formatted = formatter.formatStepResult(stepResult)

      // Then
      expect(formatted).toEqual('')
    })
  })

  describe('formatContextMutations', () => {
    it('should format a `set` mutation on a single line', async () => {
      // Given
      const ctx = await makeWhimbrelContext({})
      const formatter = new DefaultFormatter(ctx)
      const stepResult = newStepResult()
      stepResult.mutations.ctx.push({
        mutationType: 'ctx',
        type: 'set',
        path: 'source',
        key: 'banana-boat',
      })

      // When
      const formatted = formatter.formatStepResult(stepResult)

      // Then
      expect(formatted).toEqual('⇒ source: banana-boat')
    })

    it('should format multiple `set` mutations on separate lines', async () => {
      // Given
      const ctx = await makeWhimbrelContext({})
      const formatter = new DefaultFormatter(ctx)
      const stepResult = newStepResult()
      stepResult.mutations.ctx.push(
        {
          mutationType: 'ctx',
          type: 'set',
          path: 'source',
          key: 'secret-informer',
        },
        {
          mutationType: 'ctx',
          type: 'set',
          path: 'target',
          key: 'undercover-agent',
        }
      )

      // When
      const formatted = formatter.formatStepResult(stepResult)

      // Then
      expect(formatted).toEqual('⇒ source: secret-informer\n⇒ target: undercover-agent')
    })

    it('should format an `add` and a `set` of the same key as a single `add`', async () => {
      // Given
      const ctx = await makeWhimbrelContext({})
      const formatter = new DefaultFormatter(ctx)
      const stepResult = newStepResult()
      stepResult.mutations.ctx.push(
        {
          mutationType: 'ctx',
          type: 'add',
          path: 'source',
          key: 'secret-informer',
        },
        {
          mutationType: 'ctx',
          type: 'set',
          path: 'source',
          key: 'secret-informer',
        }
      )

      // When
      const formatted = formatter.formatStepResult(stepResult)

      // Then
      expect(formatted).toEqual('⊕ source: secret-informer')
    })

    it('should format an `add` and a `set` of different keys on separate lines', async () => {
      // Given
      const ctx = await makeWhimbrelContext({})
      const formatter = new DefaultFormatter(ctx)
      const stepResult = newStepResult()
      stepResult.mutations.ctx.push(
        {
          mutationType: 'ctx',
          type: 'add',
          path: 'source',
          key: 'secret-informer',
        },
        {
          mutationType: 'ctx',
          type: 'set',
          path: 'target',
          key: 'blubber',
        }
      )

      // When
      const formatted = formatter.formatStepResult(stepResult)

      // Then
      expect(formatted).toEqual('⊕ source: secret-informer\n⇒ target: blubber')
    })
  })

  describe('formatFileSystemMutations', () => {
    it('should format a created file and a modified file', async () => {
      // Given
      const ctx = await makeWhimbrelContext({})
      const formatter = new DefaultFormatter(ctx)
      const stepResult = newStepResult()
      stepResult.mutations.fs.push(
        {
          mutationType: 'fs',
          type: 'create',
          path: '/tmp/in/a/gadda/da/vida.json',
          object: 'file',
        },
        {
          mutationType: 'fs',
          type: 'modify',
          path: '/tmp/baby.yaml',
          object: 'file',
        }
      )

      // When
      const formatted = formatter.formatFileSystemMutations(stepResult.mutations.fs)

      // Then
      expect(formatted).toEqual(
        ['🛢 A /tmp/in/a/gadda/da/vida.json', '🛢 M /tmp/baby.yaml'].join('\n')
      )
    })

    it('should group created files if amount exceeds threshold', async () => {
      // Given
      const ctx = await makeWhimbrelContext({})
      const formatter = new DefaultFormatter(ctx)
      const stepResult = newStepResult()
      stepResult.mutations.fs.push(
        {
          mutationType: 'fs',
          type: 'create',
          path: '/tmp/in/a/gadda/da/vida.json',
          object: 'file',
        },
        {
          mutationType: 'fs',
          type: 'create',
          path: '/tmp/baby.yaml',
          object: 'file',
        },
        {
          mutationType: 'fs',
          type: 'create',
          path: '/tmp/secrets.txt',
          object: 'file',
        }
      )

      // When
      const formatted = formatter.formatFileSystemMutations(stepResult.mutations.fs, {
        threshold: 2,
      })

      // Then
      expect(formatted).toEqual('🛢 A 3 files')
    })
  })
})
