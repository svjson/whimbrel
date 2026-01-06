import { ScriptDescription, ScriptIntent } from '@whimbrel/core-api'
import { Emitter, ReaderState, Token } from '@whimbrel/script-parser'

import { NpmGrammar } from './grammar-npm'
import { NpmBinCommand } from './types'

interface SummaryStub {
  main?: string
  subject?: string
  context?: string
}

/**
 * Emitter for the npm command grammar
 */
export const makeNpmEmitter = (): Emitter<NpmGrammar> => {
  const nodes: NpmBinCommand[] = []
  const summaryStub: SummaryStub = {}
  const intentStub: any = {}

  /**
   * Compile the human readable summary from the stub
   *
   * @return summary string or undefined if empty
   */
  const compileSummary = (): string | undefined => {
    const summary = [summaryStub.main, summaryStub.subject, summaryStub.context]
      .filter(Boolean)
      .join(' ')
    return summary || undefined
  }

  /**
   * Compile the intent from the stub
   */
  const compileIntent = (): ScriptIntent | undefined => {
    return intentStub
  }

  /**
   * Compile the script description
   */
  const compileDescription = (): ScriptDescription => {
    return {
      summary: compileSummary(),
      intent: compileIntent(),
    }
  }

  return {
    /**
     * Collect the completed npm command node
     */
    collect(readerState: ReaderState<NpmGrammar>) {
      const { node } = readerState
      nodes.push({
        type: 'npm',
        command: node.command,
        ...(node.script ? { script: node.script } : {}),
        scope: node.scope ?? {},
        description: compileDescription(),
      } satisfies NpmBinCommand)
    },
    /**
     * Emit tokens into the npm command node
     *
     * @param readerState - The current reader state
     * @param type - The type of emittable being processed
     * @param tokenBuffer - The buffer of tokens to process
     */
    emit(
      readerState: ReaderState<NpmGrammar>,
      type: NpmGrammar['Emittable'],
      tokenBuffer: Token[]
    ): void {
      const tokenText = tokenBuffer.map((t) => t.text).join(' ')
      readerState.tokenBuf = []
      if (!readerState.node) {
        switch (type) {
          case 'type':
            readerState.node = {
              type: tokenText,
            }
            intentStub.op = 'execute'
            break
        }
        return
      }
      const { node } = readerState

      if (type === 'command') {
        node.command = tokenText
        switch (tokenText) {
          case 'run':
            summaryStub.main = 'Execute package.json script'
            intentStub.kind = 'package.json-script'
            break
          case 'publish':
            summaryStub.main = 'Publish package'
            intentStub.op = 'publish'
            intentStub.kind = 'package'
            intentStub.target = {
              type: 'module',
              module: 'self',
            }
            break
        }
        return
      }

      switch (type) {
        case 'workspaces-scope':
          node.scope = {
            type: 'workspaces',
          }
          summaryStub.context = 'in all modules'
          const intentTarget = (intentStub.target ??= {})
          intentTarget.type = 'workspace'
          break
        case 'script-name':
          node.script = tokenText
          summaryStub.subject = `"${tokenText}"`
          intentStub.id = tokenText
          intentStub.target = intentStub.target ?? {
            type: 'module',
            module: 'self',
          }
          break
        case 'if-present':
          ;(node.scope ??= {}).ifPresent = true
          ;(intentStub.target ??= {}).discriminator = 'exists'
          summaryStub.context = [summaryStub.context, 'that provide it']
            .filter(Boolean)
            .join(' ')
          break
        case 'access-type':
          const accessType = tokenBuffer.at(-1).text
          ;(node.scope ??= {}).accessType = accessType
          ;(intentStub.target.flags ??= {}).accessType = accessType

          summaryStub.main = `Publish ${accessType} package`
          break
      }
    },

    /**
     * Wrap is not applicable for this emitter
     */
    wrap(_type: never, _token: Token): void {
      // Not applicable
    },

    /**
     * Get the emitted npm command nodes
     */
    nodes(): NpmBinCommand[] {
      return nodes
    },
  }
}
