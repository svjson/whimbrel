import equal from 'fast-deep-equal'
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
    const isReference = value ? equal(Object.keys(value), ['ref']) : false
    if (isReference) {
      const candidate = resolve('object', ctx, value)
      if (candidate) {
        resolveParameter(step, param, candidate)
        continue
      }
    }

    if (!value && details.required) {
      const candidate = resolveDefault(ctx, details)
      if (candidate) {
        resolveParameter(step, param, candidate)
        continue
      }

      throw new WhimbrelError(
        `'${step.id}' - No value provided for required input '${param}'.`
      )
    }
  }
}

/**
 * Assign resolved value to inputs and mark as resolved
 */
const resolveParameter = (step: ExecutionStep, param: string, value: any) => {
  if (step.inputs[param] !== undefined) {
    ;(step.meta.originalInputs ??= {})[param] = step.inputs[param]
  }
  step.inputs[param] = value
  ;(step.meta.resolvedParameters ??= []).push(param)
}

/**
 * Resolve a specific parameter from parameter defaults, as described by
 * `details`.
 */
const resolveDefault = (ctx: WhimbrelContext, details: TaskParameter): Promise<any> => {
  for (const candidate of details.defaults) {
    const resolved = resolve('object', ctx, candidate)
    if (resolved !== null && resolved !== undefined) {
      return resolved
    }
  }
  return undefined
}

/**
 * Restore any inputs that were resolved to their original values.
 *
 * This is a requirement for resolved actors and values that may otherwise
 * survive between dry run attempts and live runs
 *
 * @param step - The execution step to restore inputs for.
 */
export const restoreInputs = (step: ExecutionStep): void => {
  for (const param of step.meta.resolvedParameters ?? []) {
    if (Object.hasOwn(step.meta.originalInputs ?? {}, param)) {
      step.inputs[param] = step.meta.originalInputs[param]
    } else {
      delete step.inputs[param]
    }
  }
}
