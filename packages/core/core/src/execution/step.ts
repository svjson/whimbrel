import { leftPad } from '@whimbrel/array'

/**
 * Split the segments of a selector, and arrange them in the correct order
 * allowing optional leading parts to be omitted.
 */
const selectorParts = (selector: string) => {
  const parts = selector.split(':')
  return leftPad(parts, 3)
}

/**
 * Test a StepIdSelector against a concrete step ID.
 *
 * This function checks if the provided selector matches the step ID
 * by comparing the first three segments of the selector with the corresponding
 * segments of the step ID.
 *
 * @param selector - The StepIdSelector to test against.
 * @param stepId - The concrete step ID to test.
 * @return true if the selector matches the step ID, false otherwise.
 */
export const matchesStepIdSelector = (selector: string, stepId: string) => {
  if (selector === stepId) return true

  const selectorSegments = selectorParts(selector)
  const stepIdSegments = selectorParts(stepId)

  for (let i = 0; i < 3; i++) {
    if (['*', undefined].includes(selectorSegments[i])) continue
    if (selectorSegments[i] !== stepIdSegments[i]) return false
  }
  return true
}
