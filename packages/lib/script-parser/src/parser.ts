import type { Transition, ParserStateMachine, State } from './state'

import type { Grammar, Parser, Token, Tokenizer } from './types'

/**
 * Describes a push-down state of the parser.
 */
export interface Context<G extends Grammar> {
  /**
   * That state from which this context originated
   */
  state: State<G>
  /**
   * A delimiter token that marks the end of this context.
   */
  delimiter: Token
  /**
   * Determines if all token content should be slurped indiscriminately
   * while this context is active.
   */
  slurp: boolean
  /**
   * The transition take in which this context was activated.
   */
  transition: Transition<G>
}

/**
 * The current state of the token reader, containing the current node under
 * construction and its processed tokens and literal node content.
 *
 * Also contains the current state of the grammar state machine.
 */
export interface ReaderState<G extends Grammar> {
  /**
   * The current state of the parser grammar state machine
   */
  state: State<G>
  /**
   * The IR node currently being constructed.
   */
  node: Record<string, any> | null
  /**
   * Buffer of read tokens
   */
  tokenBuf: Token[]
  /**
   * The literal token content of the node under construction.
   */
  nodeLiteral: string
}

/**
 * Responsible for collecting constructed nodes and responding to emit and wrap
 * instructions.
 */
export interface Emitter<G extends Grammar> {
  /**
   * Collects the node currently under construction according to the reader state.
   *
   * @param readerState - the state of the token reader
   */
  collect(readerState: ReaderState<G>): void
  /**
   * Trigger an emit event of `type`
   *
   * @param readerState - the state of the token reader
   * @param type - the type of emittable to emit
   * @param tokenBuffer - the buffer of tokens to emit
   */
  emit(readerState: ReaderState<G>, type: G['Emittable'], tokenBuffer: Token[]): void
  /**
   * Trigger a wrap event of `type`
   *
   * @param type - the type of wrappable to wrap with
   * @param token - the token triggering the wrap
   */
  wrap(type: G['Wrappable'], token: Token): void
  /**
   * Retrieve all constructed nodes.
   *
   * @return Array of constructed nodes
   */
  nodes(): G['Output'][]
}

/**
 * Create a generic token reader that navigates the grammar by applying
 * one token at a time.
 *
 * @param states - Parser state machine
 * @return Token output handler
 */
const makeTokenReader = <G extends Grammar>(
  grammar: ParserStateMachine<G>,
  emitter: Emitter<G>
) => {
  const states = grammar
  const contextStack: Context<G>[] = []

  const readerState: ReaderState<G> = {
    node: null,
    state: states.initial,
    tokenBuf: [],
    nodeLiteral: '',
  }

  return {
    /**
     * Process the side-effects of selecting `transition` from the current
     * grammar state.
     *
     * @param transition - The selected transition
     * @param token - The token that triggered this transition
     */
    processTransitionToken(transition: Transition<G>, token: Token): void {
      if (!transition.ignore) {
        readerState.tokenBuf.push(token)
      }
      if (transition.emit) {
        emitter.emit(readerState, transition.emit, readerState.tokenBuf)
      }
    },

    /**
     * Finalize the state transition by updating the current state.
     *
     * @param transition - The selected transition
     * @return void
     */
    finalizeTransition(transition: Transition<G>) {
      readerState.state =
        typeof transition.state === 'string' ? states[transition.state] : transition.state
    },

    /**
     * Read a token and update the reader state accordingly.
     *
     * @param token - The token to read
     * @return void
     */
    readToken(token: Token) {
      const transition = readerState.state.transitions.find(
        (t) =>
          (t.token === token.type && (!t.text || t.text === token.text)) ||
          (t.token === 'context-delimiter' &&
            contextStack.at(-1)?.delimiter.type === token.type &&
            contextStack.at(-1)?.delimiter.text === token.text)
      )

      if (transition) {
        if (transition.wrap) {
          if (readerState.node) emitter.collect(readerState)
          emitter.wrap(transition.wrap, token)
          readerState.nodeLiteral = ''
          readerState.node = null
        } else {
          readerState.nodeLiteral += token.text

          if (transition.context) {
            const [ctxOp, ctxState] = transition.context
            if (ctxOp === 'push') {
              contextStack.push({
                state: readerState.state,
                delimiter: token,
                slurp: true,
                transition: transition,
              })
              readerState.tokenBuf.push(token)
              readerState.state = states[ctxState]
              return
            } else if (ctxOp === 'pop') {
              const popped = contextStack.pop()
              if (popped.transition) {
                this.processTransitionToken(popped.transition, token)
                if (popped.transition.state === 'context') {
                  readerState.state = popped.state
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
          readerState.tokenBuf.push(token)
        }
        readerState.nodeLiteral += token.text
      }
    },

    /**
     * Flush the reader state, collecting any remaining node under construction.
     *
     * @return Array of constructed nodes
     */
    flush() {
      if (readerState.state.end) {
        if (readerState.state.end.emit) {
          emitter.emit(readerState, readerState.state.end.emit, readerState.tokenBuf)
        }
      }
      if (readerState.node) {
        emitter.collect(readerState)
      }
      return emitter.nodes()
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
export const parseScript = <G extends Grammar, InputType>(
  parseOpts: ParserOptions<G, InputType>,
  input: InputType
): G['Output'][] => {
  const { emitter, tokenizer, grammar } = parseOpts

  const tokens = tokenizer.tokenize(input)
  const output = makeTokenReader(grammar, emitter)

  for (const token of tokens) {
    output.readToken(token)
  }

  return output.flush()
}

/**
 * The specification required to construct a Parser.
 */
export interface ParserOptions<G extends Grammar, InputType = string> {
  grammar: ParserStateMachine<G>
  tokenizer: Tokenizer<InputType>
  emitter: Emitter<G>
}

/**
 * Create a parser that can parse InputType into a script IR.
 *
 * @param opts - Parser options
 *
 * @return A parser instance
 */
export const makeParser = <Input, G extends Grammar>(
  opts: ParserOptions<G, Input>
): Parser<Input, G['Output']> => {
  return {
    parse(input: Input) {
      return parseScript(opts, input)
    },
  }
}
