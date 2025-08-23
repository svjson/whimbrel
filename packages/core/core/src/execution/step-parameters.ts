import {
  ExecutionStep,
  TaskParameter,
  WhimbrelContext,
  WhimbrelError,
} from '@whimbrel/core-api'
import { resolve } from '@whimbrel/walk'

/**
 * Inspect the parameter configuration of the Task associated with an ExecutionStep
 * and attempt to resolve any required parameters that are not explicitly provided.
 */
export const ensureStepParameters = (ctx: WhimbrelContext, step: ExecutionStep) => {
  for (const [param, details] of Object.entries(step.parameters)) {
    const value = step.inputs[param]
    if (!value && details.required) {
      const candidate = resolveParameter(ctx, details)
      if (candidate) {
        step.inputs[param] = candidate
        ;(step.meta.resolvedParameters ??= []).push(param)
        continue
      }

      throw new WhimbrelError(
        `'${step.id}' - No value provided for required input '${param}'.`
      )
    }
  }
}

/**
 * Resolve a specific parameter, as describe by `details`.
 */
const resolveParameter = (ctx: WhimbrelContext, details: TaskParameter): Promise<any> => {
  for (const candidate of details.defaults) {
    const resolved = resolve('object', ctx, candidate)
    if (resolved !== null && resolved !== undefined) {
      return resolved
    }
  }
  return undefined
}
