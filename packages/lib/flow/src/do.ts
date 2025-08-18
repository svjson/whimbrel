import { Flow } from './dsl'

export const defineDo = <T, NS>(flow: Flow, doFn: (ns: NS) => T | Promise<T>) => {
  flow.forms.push({
    type: 'do',
    run: async () => {
      return await doFn(flow.getNamespace<NS>())
    },
  })
}
