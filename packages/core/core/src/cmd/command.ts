import { WhimbrelContext, CtxCommandOutput } from '@whimbrel/core-api'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export const cmdString = (cmd: string[] | string) => {
  return Array.isArray(cmd) ? cmd.join(' ') : cmd
}

/**
 * Runs a shell command in a specific working directory.
 *
 * @param {object} ctx - Context object (can include log prefix, dryRun, etc.)
 * @param {string} cwd - Directory in which to run the command
 * @param {string} cmd - Shell command to execute
 * @returns {Promise<string>} - The trimmed stdout result
 */
export const runCommand = async (
  ctx: WhimbrelContext,
  cwd: string,
  cmd: string | string[]
): Promise<CtxCommandOutput> => {
  cmd = cmdString(cmd)

  //  if (!ctx.options.quiet) ctx.log.debug(`[${cwd}] $ ${cmd}`)

  try {
    const { stdout, stderr } = await execAsync(cmd, { cwd })
    if (stderr && ctx.options.verbose) ctx.log.error(stderr)
    ctx.log.debug(stdout.trim())
    return [stdout, stderr]
  } catch (err) {
    console.error(`[${cwd}] Command failed: ${cmd}`)
    throw err
  }
}
