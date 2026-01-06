import { ScriptDescription } from '@whimbrel/core-api'

/**
 * Describes an `npm` command
 */
export type NpmBinCommand = {
  type: 'npm'
  command?: string
  script?: string
  scope: {
    accessType?: string
  }
  description?: ScriptDescription
}

/**
 * Describes an `npx` command
 */
export type NpxBinCommand = {
  type: 'npx'
  command?: string
  args: string[]
  description?: ScriptDescription
}

/**
 * The parser output format, either an npm or npx command.
 */
export type NpmCommand = NpmBinCommand | NpxBinCommand
