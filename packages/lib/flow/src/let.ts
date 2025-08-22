import {
  Flow,
  LetOptionParams,
  LetOptions,
  LetValue,
  LetValueProvider,
  pushScope,
} from './dsl'

function isProvider<T, NS>(v: LetValue<T, NS>): v is LetValueProvider<T, NS> {
  return typeof v === 'function'
}

const resolveValue = async <T, NS>(
  namespace: NS,
  valueDefinition: LetValue<T, NS>
): Promise<T> => {
  if (isProvider(valueDefinition)) {
    return (await valueDefinition(namespace)) as T
  }
  return valueDefinition as T
}

const normalizeOptions = (options: LetOptions): LetOptionParams => {
  if (typeof options === 'function') {
    return { journal: options }
  }

  if (typeof options === 'boolean') {
    return { private: () => options }
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
      const letValue = await resolveValue(flow.getNamespace<NS>(), value)

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
