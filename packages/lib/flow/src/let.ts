import { Flow, LetOptionParams, LetOptions, LetValue, pushScope } from './dsl'

const resolveValue = async <T, NS>(valueDefinition: LetValue<T, NS>): Promise<T> => {
  return valueDefinition as T
}

const normalizeOptions = (options: LetOptions): LetOptionParams => {
  if (typeof options === 'function') {
    return { journal: options }
  }

  if (typeof options === 'boolean') {
    return { private: options }
  }

  if (typeof options === 'string') {
    return { journal: ({ value }) => ({ name: options, value }) }
  }

  if (typeof options.journal === 'string') {
    options.journal = ({ value }) => ({
      name: options.journal as string,
      value,
    })
  }

  return options
}

export const defineLet = <T, NS>(
  flow: Flow,
  name: string,
  value: LetValue<T, NS>,
  options: LetOptions = {}
) => {
  flow.forms.push({
    type: 'let',
    run: async () => {
      const letValue = await resolveValue(value)
      const scope = pushScope(flow)
      scope.namespace[name] = letValue

      options = normalizeOptions(options)

      let journalValue = { name, value: letValue }
      let privateEntry = false

      if (typeof options.journal === 'function') {
        journalValue = options.journal(journalValue)
      }

      if (typeof options.private === 'function') {
        privateEntry = options.private(journalValue)
      }

      flow.ctx.acceptJournalEntry({
        origin: 'flow',
        type: 'let',
        payload: journalValue,
        private: privateEntry,
      })
    },
  })
}
