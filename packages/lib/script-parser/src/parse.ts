import { makeTokenizer, Token, Tokenizer } from './tokenize'

type Emittable = 'command' | 'arg' | 'env'

interface Transition {
  token?: string
  text?: string
  ignore?: boolean
  emit?: Emittable
  wrap?: 'logical' | 'forward'
  collect?: boolean
  state: string | State
}

interface EndState {
  emit?: Emittable
}

interface State {
  end?: EndState
  transitions: Transition[]
}

const states: Record<string, State> = {
  initial: {
    transitions: [
      {
        token: 'symbol',
        text: '&&',
        wrap: 'logical',
        state: 'initial',
      },
      {
        token: 'symbol',
        text: '|',
        wrap: 'forward',
        state: 'initial',
      },
      {
        token: 'word',
        state: {
          end: {
            emit: 'command',
          },
          transitions: [
            {
              token: 'whitespace',
              ignore: true,
              emit: 'command',
              state: 'args',
            },
            {
              token: 'symbol',
              text: '=',
              ignore: true,
              state: {
                transitions: [
                  {
                    token: 'word',
                    emit: 'env',
                    state: 'initial',
                  },
                  {
                    token: 'whitespace',
                    ignore: true,
                    emit: 'env',
                    state: 'initial',
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  },
  args: {
    transitions: [
      {
        token: 'symbol',
        text: '&&',
        wrap: 'logical',
        state: 'initial',
      },
      {
        token: 'symbol',
        text: '|',
        wrap: 'forward',
        state: 'initial',
      },
      {
        token: 'word',
        emit: 'arg',
        state: 'args',
      },
    ],
  },
}

const OPERATORS = {
  '&&': 'and',
  '||': 'or',
  '|': 'pipe',
}

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

const makeTokenOutput = () => {
  let output = makeNodeOutput()
  let node: Record<string, any> | null = null
  let state: State = states.initial
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
      }
      tokenBuf = []
    },

    readToken(token: Token) {
      const transition = state.transitions.find(
        (t) => t.token === token.type && (!t.text || t.text === token.text)
      )

      if (transition) {
        if (transition.wrap) {
          if (node) this.collect()
          output.wrap(transition.wrap, token.text)
          nodeLiteral = ''
          node = null
        } else {
          nodeLiteral += token.text

          if (!transition.ignore) {
            tokenBuf.push(token)
          }
          if (transition.emit) {
            this.emit(transition.emit, tokenBuf)
          }
        }
        state =
          typeof transition.state === 'string'
            ? states[transition.state]
            : transition.state
      } else {
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

const parseScript = (tokenizer: Tokenizer, literal: string): ScriptNode[] => {
  const tokens = tokenizer.tokenize(literal)
  const output = makeTokenOutput()

  for (const token of tokens) {
    output.readToken(token)
  }

  return output.flush()
}

export const makeParser = () => {
  const tokenizer = makeTokenizer()
  return {
    parse(literal: string) {
      return parseScript(tokenizer, literal)
    },
  }
}
