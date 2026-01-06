import { ApplicationLog } from '@whimbrel/core-api'
import { banner } from './banner'
import stripAnsi from 'strip-ansi'

/**
 * Plain output-adapter for ApplicatioLog, that strips ANSI messages and treats
 * status output as regular log.
 */
export class PlainAppender implements ApplicationLog {
  /**
   * Construct a new instance of PlainAppender that will
   * clean and make any log output into plain text before
   * forwarding to the provided ApplicationLog instance.
   */
  constructor(private impl: ApplicationLog) {}
  /**
   * Output a banner-like sequence of lines
   *
   * @param args - The parts of the banner message
   */
  banner(...args: string[]) {
    banner({
      message: args.map((p) => stripAnsi(p)),
      indentation: this.impl.getIndentation(),
      prefixes: ['', ': ', ' - '],
      decorators: [],
    }).forEach((l) => this.info(l))
  }
  /**
   * Log on the INFO-level
   *
   * @param args - The arguments to log.
   */
  info(...args: any[]) {
    this.impl.info(...args.map((a) => (typeof a === 'string' ? stripAnsi(a) : a)))
  }
  /**
   * Log on the DEBUG-level
   *
   * @param args - The arguments to log.
   */
  debug(...args: any[]) {
    this.impl.debug(...args.map((a) => (typeof a === 'string' ? stripAnsi(a) : a)))
  }
  /**
   * Log on the ERROR-level
   *
   * @param args - The arguments to log.
   */
  error(...args: any[]) {
    this.impl.error(...args.map((a) => (typeof a === 'string' ? stripAnsi(a) : a)))
  }
  /**
   * Log on the WARN-level
   *
   * @param args - The arguments to log.
   */
  warn(...args: any[]) {
    this.impl.warn(...args.map((a) => (typeof a === 'string' ? stripAnsi(a) : a)))
  }

  /**
   * Output a status message
   */
  showStatus(status?: string) {
    if (status) {
      this.info(status)
    }
  }
  /**
   * No operation on PlainAppender.
   */
  hideStatus() {}
  /**
   * No operation on PlainAppender.
   */
  updateStatus() {}
  /**
   * Increase the indentation-level for subsequent output.
   */
  indent() {
    this.impl.indent()
  }
  /**
   * Decrease the indentation-level for subsequent output.
   */
  deindent() {
    this.impl.deindent()
  }
  /**
   * Set indentation level
   *
   * @param indentationLevel - The indentation level to set.
   */
  setIndentation(indentationLevel: number) {
    this.impl.setIndentation(indentationLevel)
  }
  /**
   * Get the current indentation level.
   *
   * @return The current indentation level.
   */
  getIndentation() {
    return this.impl.getIndentation()
  }
}
