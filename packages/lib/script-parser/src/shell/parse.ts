import { Token } from '@src/types'
import type { ScriptNode, CommandNode, PathNode, KeywordNode } from './ir'
import { grammar, ShellGrammar } from './grammar'
import {
  makeParser as makeBaseParser,
  Emitter,
  ParserOptions,
  ReaderState,
} from '@src/parser'
import { ParserStateMachine } from '@src/state'
import { makeTokenizer } from './tokenize'

/**
 * Mapping of shell operators to their kinds.
 */
const OPERATORS = {
  '&&': 'and',
  '||': 'or',
  '|': 'pipe',
  '2>': 'err',
  '2>>': 'err-append',
  '>': 'redirect',
  '>>': 'append',
}

/**
 * Create a node output handler that collects script IR nodes.
 *
 * @return Node output handler
 */
export const makeNodeOutput = () => {
  /**
   * Collected ScriptNode instances. Ultimately the parser output.
   */
  const nodes: ScriptNode[] = []
  /**
   * Controls the target/direction of accept.
   */
  let target: 'nodes' | 'right' = 'nodes'
  /**
   * Current target node for right-side assignments.
   */
  let targetNode: ScriptNode | null = null

  return {
    /**
     * Accept a ScriptNode into the output.
     *
     * The provided node must be a fully formed ScriptNode, but further
     * parsing may modify it as needed.
     *
     * @param node ScriptNode to accept
     *
     * @return void
     */
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

    /**
     * Wrap the current or previous node in a new node of the given type.
     *
     * This promotes the current node in the output sequence to a node
     * type indicated by `type`, of which the the current node will now
     * be a member.
     *
     * @param type - The type of node to wrap with
     * @param literal - The operator literal triggering the wrap
     *
     * @return void
     */
    wrap(type: ShellGrammar['Wrappable'], literal: string) {
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

    /**
     * Return all nodes written to this output instance.
     */
    nodes() {
      return nodes
    },
  }
}

/**
 * Create an emitter for the shell parser.
 *
 * @param grammar - The parser state machine grammar
 *
 * @returns Emitter instance
 */
export const makeEmitter = (
  grammar: ParserStateMachine<ShellGrammar>
): Emitter<ShellGrammar> => {
  let output = makeNodeOutput()

  return {
    /**
     * Collect the node currently under construction and pass to
     * the output.
     *
     * @param readerState - The current reader state
     *
     * @return void
     */
    collect(readerState: ReaderState<ShellGrammar>) {
      const node = readerState.node
      if (node.type === 'command') {
        output.accept({
          type: 'command',
          args: node.args ?? [],
          env: node.env ?? {},
          command: node.command ?? '',
          literal: readerState.nodeLiteral.trim(),
        } satisfies CommandNode)
      }
      if (node.type === 'path') {
        output.accept({
          type: 'path',
          path: node.path,
          literal: readerState.nodeLiteral.trim(),
        } satisfies PathNode)
      }
      if (node.type === 'keyword') {
        output.accept({
          type: 'keyword',
          keyword: node.keyword,
          literal: readerState.nodeLiteral.trim(),
        } satisfies KeywordNode)
      }
      readerState.nodeLiteral = ''
      readerState.node = null
      readerState.state = grammar.initial
    },

    /**
     * Wrap the current or previous node in a new node of the given type.
     *
     * @param type - The type of node to wrap with
     * @param token - The token triggering the wrap
     * @return void
     */
    wrap(type: ShellGrammar['Wrappable'], token: Token) {
      output.wrap(type, token.text)
    },

    /**
     * Return all nodes written to this emitter's output.
     */
    nodes(): ScriptNode[] {
      return output.nodes()
    },

    /**
     * Emit tokens of a given type into the current node under construction as
     * a property indicated by `type`
     *
     * @param readerState - The current reader state
     * @param type - The type of emittable to emit
     * @param tokens - The tokens to emit
     *
     * @return void
     */
    emit(
      readerState: ReaderState<ShellGrammar>,
      type: ShellGrammar['Emittable'],
      tokens: Token[]
    ) {
      const node = (readerState.node ??= {})
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
      readerState.tokenBuf = []
    },
  }
}

/**
 * Create a shell script parser.
 *
 * @param opts - Parser options
 * @returns Parser instance
 */
export const makeParser = (opts: Partial<ParserOptions<ShellGrammar, string>> = {}) => {
  const parserOpts = {
    grammar: opts.grammar ?? grammar,
    tokenizer: opts.tokenizer ?? makeTokenizer(),
    emitter: opts.emitter ?? makeEmitter(opts.grammar ?? grammar),
  }

  return makeBaseParser<string, ShellGrammar>(parserOpts)
}
