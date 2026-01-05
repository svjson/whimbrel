export type Emittable = 'command' | 'arg' | 'env' | 'path' | 'keyword'

export interface Transition {
  token?: string
  text?: string
  ignore?: boolean
  emit?: Emittable
  wrap?: 'logical' | 'forward'
  context?: ['push', string] | ['pop']
  collect?: boolean
  state: string | State
}

interface EndState {
  emit?: Emittable
}

export interface State {
  end?: EndState
  transitions: Transition[]
}

export type ParserStateMachine = {
  initial: State
  [key: string]: State
}

export const states: ParserStateMachine = {
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
        text: '||',
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
        text: 'true',
        emit: 'keyword',
        collect: true,
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
        text: '||',
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
        token: 'symbol',
        text: '2>',
        wrap: 'forward',
        state: {
          transitions: [
            {
              token: 'word',
              emit: 'path',
              collect: true,
              state: 'initial',
            },
          ],
        },
      },
      {
        token: 'string',
        state: 'in-arg',
      },
      {
        token: 'word',
        state: 'in-arg',
      },
    ],
  },
  'in-arg': {
    end: {
      emit: 'arg',
    },
    transitions: [
      {
        token: 'whitespace',
        ignore: true,
        emit: 'arg',
        state: 'args',
      },
      {
        token: 'string',
        state: 'in-arg',
      },
      {
        token: 'word',
        state: 'in-arg',
      },
    ],
  },
}
