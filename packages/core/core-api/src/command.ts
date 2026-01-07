import { WhimbrelContext } from './context'

export type CtxCommandOutput = [string, string]

/**
 * A command runner function that executes external commands on the host
 * system.
 *
 * @param ctx - The Whimbrel context, providing environment and logging
 *              facilities for the execution.
 * @param cwd - The current working directory to execute the command in.
 * @param command - The command to execute, either as a string or an array
 *
 * @return A promise that resolves to a tuple containing the command's
 */
export type CommandRunner = (
  ctx: WhimbrelContext,
  cwd: string,
  command: string | string[]
) => Promise<CtxCommandOutput>

/**
 * A command runner function that executes external commands on the host
 * system.
 *
 * This signature is for contexts where the function either has internal
 * access to a WhimbrelContext or does not require one to execute.
 *
 * @param cwd - The current working directory to execute the command in.
 * @param command - The command to execute, either as a string or an array
 *
 * @return A promise that resolves to a tuple containing the command's
 */
export type CtxCommandRunner = (
  cwd: string,
  command: string | string[]
) => Promise<CtxCommandOutput>
