import path from 'node:path'
import { fileURLToPath } from 'node:url'
import which from 'which'
import { spawn } from 'node:child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const whimbrelCliDist = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'packages',
  'cli',
  'dist'
)
const whimbrelIndex = path.join(whimbrelCliDist, 'index.cjs')

const node = await which('node')

export const normalizeOutput = (output: string) => {
  return output.replace(/whim-repo-\w+/g, 'whim-repo-XXXX')
}

export function whimCli(cwd: string) {
  return {
    stdout: '',
    stderr: '',

    async execute(args: string[] | string) {
      return new Promise<void>((resolve, reject) => {
        const env: any = {}
        if (!args.includes('--no-color')) {
          env.FORCE_COLOR = '1'
        }

        const proc = spawn(
          node,
          [whimbrelIndex, ...(Array.isArray(args) ? args : [args])],
          {
            cwd,
            stdio: ['ignore', 'pipe', 'pipe'],
            env,
          }
        )

        let stdout = Buffer.alloc(0)
        let stderr = ''

        proc.stdout.on(
          'data',
          (chunk) => (stdout = Buffer.concat([stdout, Buffer.from(chunk)]))
        )
        proc.stderr.on('data', (chunk) => (stderr += chunk.toString()))

        proc.on('error', reject)
        proc.on('close', (code) => {
          this.stdout = normalizeOutput(stdout.toString('utf8'))
          this.stderr = stderr
          if (code === 0) resolve()
          else reject(new Error(`whimbrel exited with code ${code}\n${stderr}`))
        })
      })
    },
  }
}
