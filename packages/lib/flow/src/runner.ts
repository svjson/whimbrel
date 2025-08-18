import { Flow, FlowRunner } from './dsl'

/**
 * makeFlowRunner creates a flow runner object that can execute a series of forms.
 * It iterates through the forms defined in the flow and executes them sequentially.
 * If the flow is interrupted by a break condition, it stops execution.
 *
 * @param flow - The flow object containing forms to execute.
 * @return An object with a run method that executes the flow.
 */
export const makeFlowRunner = (flow: Flow): FlowRunner => {
  return {
    run: async () => {
      let lastResult = null
      for (const form of flow.forms) {
        if (flow.break) return
        lastResult = await form.run()
      }
      return lastResult
    },
  }
}
