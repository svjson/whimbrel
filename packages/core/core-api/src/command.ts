import { WhimbrelContext } from './context'

export type CtxCommandOutput = [string, string]

export type CommandRunner = (
  ctx: WhimbrelContext,
  cwd: string,
  command: string | string[]
) => Promise<CtxCommandOutput>

export type CtxCommandRunner = (
  cwd: string,
  command: string | string[]
) => Promise<CtxCommandOutput>
