import { ExecutionStep, JournalEntry, StepExecutionResult } from './execution'
import { FileSystemMutation } from './fs'
import { ContextMutation } from './mutation'
import { VCSMutation } from './vcs'

/**
 * Indent a message by a given number of indentation levels..
 *
 * @param indentation - the number of indentation levels to apply.
 * @param message - the message to indent.
 *
 * @return the indented message.
 */
export const indent = (indentation: number, message: string) => {
  return message
    .split('\n')
    .map((l) => `${' '.repeat(indentation * 2)}${l}`)
    .join('\n')
}

/**
 * Options for formatting of file lists.
 */
export interface FileListOptions {
  limit?: boolean
  threshold?: number
}

/**
 * Formatter is an interface for formatting execution steps.
 */
export interface Formatter {
  /**
   * Formats the title of an execution step for output.
   *
   * @param node - The execution step to format.
   *
   * @return A formatted string representing the step title.
   */
  formatStepTitle(node: ExecutionStep): string
  /**
   * Format a collection of file system mutations for output.
   *
   * A limit can be applied to the number of lines produced.
   * Although Tthe format of the output is dependent on the concrete
   * implementation, it can be expected to honor the limits set
   * by `options`.
   *
   * @param entries - The FileSystemMutations to format.
   * @param options - Optional formatting options for file lists.
   * @return A formatted string representing the file system mutations.
   */
  formatFileSystemMutations(
    entries: FileSystemMutation[],
    options?: FileListOptions
  ): string
  /**
   * Format a collection of ContextMutations for output.
   *
   * @param mutations - The ContextMutations to format.
   *
   * @return A formatted string representing the mutations.
   */
  formatContextMutations(mutations: ContextMutation[]): string
  /**
   * Format a collection of JournalEntries for output.
   *
   * @param entries - The JournalEntries to format.
   *
   * @return A formatted string representing the journal entries.
   */
  formatJournalEntries(entries: JournalEntry[]): string
  /**
   * Format a collection of version control mutations for output.
   *
   * A limit can be applied to the number of lines produced.
   * Although Tthe format of the output is dependent on the concrete
   * implementation, it can be expected to honor the limits set
   * by `options`.
   *
   * @param entries - The VCSMutations to format.
   * @param options - Optional formatting options for file lists.
   * @return A formatted string representing the VCS mutations.
   */
  formatVersionControlMutations(
    mutations: VCSMutation[],
    options?: FileListOptions
  ): string
  /**
   * Format a StepExecutionResult for output.
   *
   * @param stepResult - The StepExecutionResult to format.
   *
   * @return A formatted string representing the step result.
   */
  formatStepResult(stepResult: StepExecutionResult): string
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
  banner: (...args: string[]) => void
  /**
   * Log on the INFO-level
   */
  info: (...args: any[]) => void
  /**
   * Log on the DEBUG-level
   */
  debug: (...args: any[]) => void
  /**
   * Log on the ERROR-level
   */
  error: (...args: any[]) => void
  /**
   * Log on the WARN-level
   */
  warn: (...args: any[]) => void
  /**
   * Show a semi-persistent status message, according to the implementation.
   */
  showStatus: (status?: string) => void
  /**
   * Hide the status message, if present.
   */
  hideStatus: () => void
  /**
   * Update the contents of the status message.
   */
  updateStatus: (status: string) => void
  /**
   * Increase the indentation-level for subsequent output.
   */
  indent: () => void
  /**
   * Decrease the indentation-level for subsequent output.
   */
  deindent: () => void
  /**
   * Set indentation
   */
  setIndentation: (indentationLevel: number) => void
}

/**
 * Stock instance of a NullAppender - that throws any output straight into
 * the void.
 */
export const NullAppender: ApplicationLog = {
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
  setIndentation: () => null,
}
