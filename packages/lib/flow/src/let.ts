import {
  Flow,
  LetOptionParams,
  LetOptions,
  LetValue,
  LetValueProvider,
  NameValuePair,
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

/**
 * Normalizes the let option shorthands into a predicable LetOptionParams format.
 *
 * If options are provided as a function, it is treated as a journal formatter.
 * If provided as a boolean, it is treated as a private flag.
 * If provided as a string, it is treated as a journal name template.
 * If the value for `journal` in a provided LetOptionParams is a string, it is converted
 * into a journal formatter function.
 *
 * @param options - The let options to normalize.
 * @returns The normalized let option parameters.
 */
const normalizeOptions = <V, J = V>(options: LetOptions<V>): LetOptionParams<V> => {
  if (typeof options === 'function') {
    return { journal: options }
  }

  if (typeof options === 'boolean') {
    return { private: () => options }
  }

  if (typeof options === 'string') {
    return {
      journal: ({ value }) => ({ name: options, value: value as unknown as J }),
    }
  }

  if (typeof options.journal === 'string') {
    options.journal = ({ value }) => ({
      name: options.journal as string,
      value: value as unknown as J,
    })
  }

  return options
}

export const defineLet = <T, NS>(
  flow: Flow,
  name: string,
  value: LetValue<T, NS>,
  options: LetOptions<T> = {}
) => {
  flow.forms.push({
    type: 'let',
    run: async () => {
      const letValue = await resolveValue(flow.getNamespace<NS>(), value)

      const scope = pushScope(flow)
      scope.namespace[name] = letValue

      options = normalizeOptions(options)

      let journalValue: NameValuePair<any> = { name, value: letValue }
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
