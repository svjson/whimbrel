import { describe, test, it, expect } from 'vitest'

import { PlainAppender } from '@src/output'
import { ApplicationLog } from '@whimbrel/core-api'
import chalk from 'chalk'

class FakeLog implements ApplicationLog {
  constructor(indentLevel: number = 0) {
    this.indentation = indentLevel
  }
  invocations: Record<string, any[]> = {}
  indentation = 0
  banner(...args: string[]) {
    ;(this.invocations['banner'] ??= []).push(args)
  }
  info(...args: any[]) {
    ;(this.invocations['info'] ??= []).push(args)
  }
  debug(...args: any[]) {
    ;(this.invocations['debug'] ??= []).push(args)
  }
  error(...args: any[]) {
    ;(this.invocations['error'] ??= []).push(args)
  }
  warn(...args: any[]) {
    ;(this.invocations['warn'] ??= []).push(args)
  }
  showStatus(status?: string) {
    ;(this.invocations['showStatus'] ??= []).push(status)
  }
  hideStatus() {
    ;(this.invocations['hideStatus'] ??= []).push(undefined)
  }
  updateStatus(status: string) {
    ;(this.invocations['updateStatus'] ??= []).push(status)
  }
  indent() {
    this.indentation++
    ;(this.invocations['indent'] ??= []).push(undefined)
  }
  deindent() {
    this.indentation--
    ;(this.invocations['deindent'] ??= []).push(undefined)
  }
  setIndentation(indentationLevel: number) {
    this.indentation = indentationLevel
    ;(this.invocations['setIndentation'] ??= []).push(undefined)
  }
  getIndentation() {
    ;(this.invocations['getIndentation'] ??= []).push(undefined)
    return this.indentation
  }
}

describe('PlainAppender', () => {
  type LogLevel = 'info' | 'debug' | 'warn' | 'error'
  type LogCase = [LogLevel, string[], string[]]

  const logCases: LogCase[] = ['info', 'debug', 'warn', 'error'].flatMap(
    (level: LogLevel) =>
      [
        [['test message'], ['test message']],
        [
          ['a', 'b', 'c'],
          ['a', 'b', 'c'],
        ],
        [
          ['a', 'b', 'c', 'd'],
          ['a', 'b', 'c', 'd'],
        ],
        [[chalk.green('test message')], ['test message']],
        [
          [chalk.red('a'), chalk.green('b'), chalk.blue('c')],
          ['a', 'b', 'c'],
        ],
      ].map((c: [string[], string[]]): LogCase => [level, ...c])
  )

  describe('Log messages', () => {
    test.each(logCases)('%s - %s', (level, input, delegated) => {
      // Given
      const impl = new FakeLog()
      const appender = new PlainAppender(impl)

      // When
      appender[level](...input)

      // Then
      expect(impl.invocations[level]).toEqual([delegated])
      expect(Object.keys(impl.invocations)).toEqual([level])
    })
  })

  describe('Indentation', () => {
    it('should delegate indent', () => {
      // Given
      const impl = new FakeLog()
      const appender = new PlainAppender(impl)

      // When
      appender.indent()

      // Then
      expect(impl.invocations['indent']).toHaveLength(1)
      expect(Object.keys(impl.invocations)).toEqual(['indent'])
      expect(impl.getIndentation()).toEqual(1)
    })

    it('should delegate deindent', () => {
      // Given
      const impl = new FakeLog(4)
      const appender = new PlainAppender(impl)

      // When
      appender.deindent()

      // Then
      expect(impl.invocations['deindent']).toHaveLength(1)
      expect(Object.keys(impl.invocations)).toEqual(['deindent'])
      expect(impl.getIndentation()).toEqual(3)
    })

    it('should delegate getIndentation', () => {
      // Given
      const impl = new FakeLog(4)
      const appender = new PlainAppender(impl)

      // When
      const il = appender.getIndentation()

      // Then
      expect(impl.invocations['getIndentation']).toHaveLength(1)
      expect(Object.keys(impl.invocations)).toEqual(['getIndentation'])
      expect(impl.getIndentation()).toEqual(4)
      expect(il).toBe(4)
    })
  })

  describe('status messages', () => {
    it('should print updateStatus message once.', () => {
      // Given
      const impl = new FakeLog(4)
      const appender = new PlainAppender(impl)

      // When
      appender.showStatus('Things...!')
      appender.hideStatus()
      appender.showStatus()

      // Then
      expect(impl.invocations['info']).toEqual([['Things...!']])
      expect(Object.keys(impl.invocations)).toEqual(['info'])
    })
  })
})
