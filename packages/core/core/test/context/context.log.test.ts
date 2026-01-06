import { describe, expect, it } from 'vitest'
import { ApplicationLog, makeWhimbrelContext, NullAppender } from '@src/index'

class DummyLogger implements ApplicationLog {
  banner: (...args: string[]) => {}
  info: (...args: any[]) => {}
  debug: (...args: any[]) => {}
  error: (...args: any[]) => {}
  warn: (...args: any[]) => {}
  showStatus: (status?: string) => {}
  hideStatus: () => {}
  updateStatus: (status: string) => {}
  indent: () => {}
  deindent: () => {}
  setIndentation: (indentationLevel: number) => {}
  getIndentation: () => 0
}

describe('makeWhimbrelContext', () => {
  describe('instance log', () => {
    it('should construct context with NullAppender if no instance is provided', async () => {
      const ctx = await makeWhimbrelContext({})
      expect(ctx.log).toBe(NullAppender)
    })
    it('should construct context with supplied logger instance', async () => {
      const ctx = await makeWhimbrelContext({
        log: new DummyLogger(),
      })
      expect(ctx.log).toBeInstanceOf(DummyLogger)
    })
    it('should override supplied logger instance with NullAppender if "silent" option is active', async () => {
      const ctx = await makeWhimbrelContext(
        {
          log: new DummyLogger(),
        },
        {
          silent: true,
          prop: {},
        }
      )
      expect(ctx.log).toBe(NullAppender)
    })
  })
})
