import { Flow, LetOptions, LetValue, pushScope } from './dsl'

const resolveValue = async <T, NS>(valueDefinition: LetValue<T, NS>): Promise<T> => {
  return valueDefinition as T
}

export const defineLet = <T, NS>(
  flow: Flow,
  name: string,
  value: LetValue<T, NS>,
  options?: LetOptions
) => {
  options = options ?? {}

  flow.forms.push({
    type: 'let',
    run: async () => {
      const letValue = await resolveValue(value)

      const scope = pushScope(flow)
      const letEntry = { name, value: letValue }
      scope.namespace[name] = letValue
    },
  })
}
