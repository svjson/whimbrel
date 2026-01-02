import { Command } from 'commander'
import { addAnalyzeCommand } from './analyze'
import { addDescribeFacetCommand } from './describe-facet'
import { addExecuteTaskCommand } from './execute-task'
import { addQueryCommand } from './query'

/**
 * Register all CLI commands to the main Commander instance.
 */
export const addCommands = (program: Command) => {
  const preParserProgram = new Command()

  addAnalyzeCommand(program)
  addDescribeFacetCommand(program)
  addQueryCommand(program)
  addExecuteTaskCommand(program, preParserProgram)

  for (const cmd of program.commands) {
    let preParserCmd = preParserProgram.commands.find((p) => p.name() === cmd.name())
    if (!preParserCmd) {
      preParserCmd = preParserProgram.command(cmd.name())
      cmd.aliases().forEach((a) => preParserCmd.alias(a))
      preParserCmd.allowExcessArguments()
      preParserCmd.allowUnknownOption()
    }
    preParserCmd.helpOption(false)
    preParserCmd.helpCommand(false)
    preParserCmd.allowUnknownOption(true)
  }

  return preParserProgram
}
