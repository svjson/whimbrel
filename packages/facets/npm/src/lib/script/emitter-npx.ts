import { ScriptDescription, ScriptIntent } from '@whimbrel/core-api'
import { Emitter, ReaderState, Token } from '@whimbrel/script-parser'

import { NpxGrammar } from './grammar-npx'
import { NpxBinCommand } from './types'

interface SummaryStub {
  main?: string
  subject?: string
  context?: string
}

/**
 * Emitter for the npx command grammar
 */
export const makeNpxEmitter = (): Emitter<NpxGrammar> => {
  const nodes: NpxBinCommand[] = []
  const summaryStub: SummaryStub = {}
  const intentStub: any = {}

  const compileSummary = (): string | undefined => {
    const summary = [summaryStub.main, summaryStub.subject, summaryStub.context]
      .filter(Boolean)
      .join(' ')
    return summary || undefined
  }
  const compileIntent = (): ScriptIntent | undefined => {
    return intentStub
  }
  const compileDescription = (): ScriptDescription => {
    return {
      summary: compileSummary(),
      intent: compileIntent(),
    }
  }

  return {
    /**
     * Collect the completed npx command node
     */
    collect(readerState: ReaderState<NpxGrammar>) {
      nodes.push({
        type: 'npx',
        command: readerState.node.command,
        args: readerState.node.args ?? [],
        description: compileDescription(),
      })
    },

    /**
     * Emit tokens into the npx command node
     */
    emit(
      readerState: ReaderState<NpxGrammar>,
      type: NpxGrammar['Emittable'],
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
      }

      ;(node.args ??= []).push(tokenText)
    },

    /**
     * Wrap is not applicable for npx emitter
     */
    wrap(_type: never, _token: Token): void {
      // Not applicable
    },

    /**
     * Get the emitted npx command nodes
     */
    nodes(): NpxBinCommand[] {
      return nodes
    },
  }
}
