import { Command } from 'commander'
import { addAnalyzeCommand } from './analyze'
import { addDescribeFacetCommand } from './describe-facet'

/**
 * Register all CLI commands to the main Commander instance.
 */
export const addCommands = (program: Command) => {
  addAnalyzeCommand(program)
  addDescribeFacetCommand(program)
}
