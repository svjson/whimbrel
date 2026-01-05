import { makeTokenizer, Token, Tokenizer } from './tokenize'
import {
  states,
  Transition,
  type Emittable,
  type ParserStateMachine,
  type State,
} from './state'

import type { ScriptNode, CommandNode, PathNode, KeywordNode } from './types'

const OPERATORS = {
  '&&': 'and',
  '||': 'or',
  '|': 'pipe',
  '2>': 'err',
  '2>>': 'err-append',
  '>': 'redirect',
  '>>': 'append',
}

interface Context {
  state: State
  delimiter: Token
  slurp: boolean
  transition: Transition
}

/**
 * Create a node output handler that collects script IR nodes.
 *
 * @return Node output handler
 */
const makeNodeOutput = () => {
  const nodes: ScriptNode[] = []
  let target: 'nodes' | 'right' = 'nodes'
  let targetNode: ScriptNode | null = null

  return {
    accept(node: ScriptNode) {
      if (target === 'nodes') {
        nodes.push(node)
      } else if (target === 'right') {
        if (
          targetNode &&
          (targetNode.type === 'logical' || targetNode.type == 'forward')
        ) {
          targetNode.right = node
          targetNode.literal = [targetNode.literal, node.literal].join(' ')
        }
      }
    },

    nodes() {
      return nodes
    },

    wrap(type: 'logical' | 'forward', literal: string) {
      const leftNode: ScriptNode = nodes.length
        ? nodes.pop()
        : { type: 'no-op', literal: '' }

      targetNode = {
        type,
        kind: OPERATORS[literal],
        operator: literal,
        literal: [leftNode.literal, literal].join(' '),
        left: leftNode,
        right: { type: 'no-op', literal: '' },
      }

      target = 'right'

      nodes.push(targetNode)
    },
  }
}

/**
 * Create a token output handler that converts tokens into script IR nodes.
 *
 * @param states - Parser state machine
 * @return Token output handler
 */
const makeTokenOutput = (states: ParserStateMachine) => {
  let output = makeNodeOutput()
  let node: Record<string, any> | null = null
  let state: State = states.initial
  let contextStack: Context[] = []
  let tokenBuf = []
  let nodeLiteral = ''

  return {
    collect() {
      if (node.type === 'command') {
        output.accept({
          type: 'command',
          args: node.args ?? [],
          env: node.env ?? {},
          command: node.command ?? '',
          literal: nodeLiteral.trim(),
        } satisfies CommandNode)
      }
      if (node.type === 'path') {
        output.accept({
          type: 'path',
          path: node.path,
          literal: nodeLiteral.trim(),
        } satisfies PathNode)
      }
      if (node.type === 'keyword') {
        output.accept({
          type: 'keyword',
          keyword: node.keyword,
          literal: nodeLiteral.trim(),
        } satisfies KeywordNode)
      }
      nodeLiteral = ''
      node = null
      state = states.initial
    },

    emit(type: Emittable, tokens: Token[]) {
      if (!node) node = {}
      switch (type) {
        case 'command':
          node.type = 'command'
          node.command = tokens.map((t) => t.text).join('')
          break
        case 'arg':
          ;(node.args ??= []).push(tokens.map((t) => t.text).join(''))
          break
        case 'env':
          const [key, value] = tokens.map((t) => t.text)
          ;(node.env ??= {})[key] = value
          break
        case 'path':
          node.type = 'path'
          node.path = tokens.map((t) => t.text).join('')
          break
        case 'keyword':
          node.type = 'keyword'
          node.keyword = tokens.map((t) => t.text).join('')
          break
      }
      tokenBuf = []
    },

    processTransitionToken(transition: Transition, token: Token) {
      if (!transition.ignore) {
        tokenBuf.push(token)
      }
      if (transition.emit) {
        this.emit(transition.emit, tokenBuf)
      }
    },

    finalizeTransition(transition: Transition) {
      state =
        typeof transition.state === 'string' ? states[transition.state] : transition.state
    },

    readToken(token: Token) {
      const transition = state.transitions.find(
        (t) =>
          (t.token === token.type && (!t.text || t.text === token.text)) ||
          (t.token === 'context-delimiter' &&
            contextStack.at(-1)?.delimiter.type === token.type &&
            contextStack.at(-1)?.delimiter.text === token.text)
      )

      if (transition) {
        if (transition.wrap) {
          if (node) this.collect()
          output.wrap(transition.wrap, token.text)
          nodeLiteral = ''
          node = null
        } else {
          nodeLiteral += token.text

          if (transition.context) {
            const [ctxOp, ctxState] = transition.context
            if (ctxOp === 'push') {
              contextStack.push({
                state,
                delimiter: token,
                slurp: true,
                transition: transition,
              })
              tokenBuf.push(token)
              state = states[ctxState]
              return
            } else if (ctxOp === 'pop') {
              const popped = contextStack.pop()
              if (popped.transition) {
                this.processTransitionToken(popped.transition, token)
                if (popped.transition.state === 'context') {
                  state = popped.state
                } else {
                  this.finalizeTransition(popped.transition)
                }
              }
              return
            }
          }

          this.processTransitionToken(transition, token)
        }
        this.finalizeTransition(transition)
      } else {
        if (contextStack.at(-1)?.slurp) {
          tokenBuf.push(token)
        }
        nodeLiteral += token.text
      }
    },

    flush() {
      if (state.end) {
        if (state.end.emit) {
          this.emit(state.end.emit, tokenBuf)
        }
      }
      if (node) {
        this.collect()
      }
      return output.nodes()
    },
  }
}

/**
 * Parse a script literal into a script IR, using the provided parser options.
 *
 * @param parseOpts - Parser options
 * @param literal - The script literal to parse
 *
 * @return The parsed script IR
 */
const parseScript = (parseOpts: ParserOptions, literal: string): ScriptNode[] => {
  const { tokenizer, grammar } = parseOpts

  const tokens = tokenizer.tokenize(literal)
  const output = makeTokenOutput(grammar)

  for (const token of tokens) {
    output.readToken(token)
  }

  return output.flush()
}

export interface ParserOptions {
  tokenizer: Tokenizer
  grammar: ParserStateMachine
}

/**
 * Create a parser that can convert a script literal into a script IR.
 *
 * @param opts - Parser options
 *
 * @return A parser instance
 */
export const makeParser = (opts: Partial<ParserOptions> = {}) => {
  const parseOpts: ParserOptions = {
    tokenizer: opts.tokenizer ?? makeTokenizer(),
    grammar: opts.grammar ?? states,
  }

  return {
    parse(literal: string) {
      return parseScript(parseOpts, literal)
    },
  }
}
