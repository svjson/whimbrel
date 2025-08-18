import { PropertyPath } from './types'
import { walk } from './walk'
import { walkPath } from './walk-path'

/**
 * Utility function for testing if an object or a nested path inside an object
 * contains a set of key/value properties.
 *
 * If the path specified by `propertyPath` is not an object, the functio will
 * return false.
 *
 * Example:
 * ```ts
 * const object = {
 *   profile: {
 *    attributes: {
 *     physical: {
 *      'shoe-size': 14,
 *      'nose-size': 'gargantuan'
 *     },
 *    },
 *   },
 * }
 *
 * containsAll(object, 'profile.attributes.physical', [
 *   ['shoe-size', 14],
 *   ['nose-size', 'gargantuan'],
 * ])
 * // => true
 * ```
 *
 * @param object - The object to check.
 * @param propertyPath - The path to the object to check, either as a string or an array of segments.
 * @param values - An array of key/value pairs to check for in the object at the specified path.
 *
 * @return true if all key/value pairs are found in the object at the specified path, false otherwise.
 */
export const containsAll = (
  object: any,
  propertyPath: PropertyPath,
  values: [string, any][]
) => {
  if (values.length === 0) return true
  return walkPath(
    object,
    propertyPath,
    () => false,
    (_node, _prop, value) => {
      if (typeof value !== 'object') return false
      return values.reduce((result: boolean, kv) => {
        return result && value[kv[0]] === kv[1]
      }, true)
    }
  )
}

/**
 * Return the property paths of all "leaf" nodes of an object, and their values.
 *
 * This function will traverse the object and return an object where
 * the keys are the property paths (as strings) and the values are the
 * corresponding values at those paths.
 *
 * Example:
 * ```ts
 * const object = {
 *   id: 8,
 *   profile: {
 *    name: "Konny",
 *    attributes: {
 *      physical: {
 *       'shoe-size': 14,
 *       'nose-size': 'gargantuan'
 *      },
 *    },
 *   },
 * }
 *
 * propertyPaths(object)
 * // => {
 *  'id': 8,
 *  'profile.name': 'Konny',
 *  'profile.attributes.physical.shoe-size': 14,
 *  'profile.attributes.physical.nose-size': 'gargantuan'
 * }
 */
export const propertyPaths = (object: any) => {
  const paths = {}
  walk(object, {
    onEnd: ({ path, value }) => (paths[path.join('.')] = value),
  })
  return paths
}
