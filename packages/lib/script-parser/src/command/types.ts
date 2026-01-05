/**
 * Input type for the command parser of this module.
 *
 * Structurally compatible with the CommandNode of the output IR format of
 * the shell parser module.
 */
export interface Command {
  /**
   * The command name
   */
  command: string
  /**
   * The command arguments
   */
  args: string[]
}
