import { WhimbrelContext, CtxCommandOutput } from '@whimbrel/core-api'
import { spawn } from 'child_process'

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
  const [program, ...args] = Array.isArray(cmd) ? cmd : cmd.split(' ')

  if (ctx.options.verbose) ctx.log.debug(`[${cwd}] $ ${cmd}`)
  return new Promise((resolve, reject) => {
    let stdout = ''
    let stderr = ''

    const child = spawn(program, args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    })

    child.stdout.on('data', (data) => (stdout += data))
    child.stderr.on('data', (data) => (stderr += data))

    child.on('error', (err) => {
      // happens if command not found
      ctx.log.error(`Failed to execute command: ${program}`)
      reject(err)
    })

    child.on('close', (code) => {
      if (code === 0) {
        if (ctx.options.verbose) {
          if (stdout.trim()) ctx.log.debug(stdout.trim())
          if (stderr.trim() && ctx.options.verbose) ctx.log.error(stderr.trim())
        }
        resolve([stdout, stderr])
      } else {
        reject(
          new Error(`[${cwd}] Command failed (${code}): ${program} ${args.join(' ')}`)
        )
      }
    })
  })
}
