import { ExecutionStep } from './execution'

/**
 * Indent a message by a given number of indentation levels..
 *
 * @param indentation - the number of indentation levels to apply.
 * @param message - the message to indent.
 *
 * @return the indented message.
 */
export const indent = (indentation: number, message: string) => {
  return `${' '.repeat(indentation * 2)}${message}`
}

/**
 * Formatter is an interface for formatting execution steps.
 * It is used to format the title of an execution step for display in the
 * application log.
 */
export interface Formatter {
  formatStepTitle(node: ExecutionStep): string
}

/**
 * ApplicationLog is an interface for logging messages in the application.
 * It provides methods for logging messages at different levels,
 * showing and hiding status messages, and managing indentation.
 *
 * It is globally used across Whimbrel to ensure that output is consistent
 * with global output options and formats.
 */
export interface ApplicationLog {
  /**
   * Displays the argument messages as a banner.
   */
  banner: Function
  /**
   * Log on the INFO-level
   */
  info: Function
  /**
   * Log on the DEBUG-level
   */
  debug: Function
  /**
   * Log on the ERROR-level
   */
  error: Function
  /**
   * Log on the WARN-level
   */
  warn: Function
  /**
   * Show a semi-persistent status message, according to the implementation.
   */
  showStatus: Function
  /**
   * Hide the status message, if present.
   */
  hideStatus: Function
  /**
   * Update the contents of the status message.
   */
  updateStatus: Function
  /**
   * Increase the indentation-level for subsequent output.
   */
  indent: Function
  /**
   * Decrease the indentation-level for subsequent output.
   */
  deindent: Function
}

/**
 * Stock instance of a NullAppender - that throws any output straight into
 * the void.
 */
export const NullAppender = {
  banner: () => null,
  info: () => null,
  debug: () => null,
  error: () => null,
  warn: () => null,
  showStatus: (_statusText: string) => null,
  hideStatus: () => null,
  updateStatus: (_statusText: string) => null,
  indent: () => null,
  deindent: () => null,
}
