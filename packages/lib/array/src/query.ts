import equal from 'fast-deep-equal'

import { readPath, PropertyPath } from '@whimbrel/walk'

/**
 * Checks if an array contains a value, using deep equality for objects.
 *
 * If the value is an object, it uses `fast-deep-equal` for comparison.
 * If the value is a primitive, it uses strict equality (===), but in these
 * cases `Array.prototype.includes` is the better option.
 *
 * @param array - The array to check.
 * @param value - The value to check for in the array.
 */
export const includesEqual = <T>(array: T[], value: T) => {
  return array.some((v) => equal(v, value))
}

/**
 * Returns a new array containing only unique values from the input array.
 *
 * If a `select` option is provided, it will use the value at that path
 * to determine uniqueness.
 *
 * @param array - The input array from which to extract unique values.
 * @param opts - Optional parameters.
 */
export const unique = <T>(array: T[], opts: { select?: PropertyPath } = {}) => {
  const { select } = opts
  if (!select) {
    return Array.from(new Set(array))
  }

  const matches = []
  const result = []
  array.forEach((v) => {
    const ident = readPath(v, select)
    if (!matches.includes(ident)) {
      result.push(v)
      matches.push(ident)
    }
  })

  return result
}
