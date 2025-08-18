import type { PropertyPath } from './types'
import { walk } from './walk'
import { walkPath } from './walk-path'

/**
 * Utility function for writing to a nested path on an object.
 * If the path does not exist, it will be created.
 *
 * ```ts
 * writePath({ nested: { things: {} }, 'nested.objects', 'here')
 * // => { nested: { things: {}, objects: 'here' }}
 * ```
 *
 * @param object - The object to write to.
 * @param propertyPath - The path to write to, either as a string or an array of segments.
 * @param value - The value to write at the specified path.
 *
 * @return The modified object with the value written at the specified path.
 */
export const writePath = (object: any, propertyPath: PropertyPath, value: any) => {
  return walkPath(
    object,
    propertyPath,
    (node, propName) => {
      node[propName] = {}
    },
    (node, propName) => (node[propName] = value)
  )
}

/**
 * Utility function for reading a value from a nested path on an object.
 * If the path does not exist, it will return null.
 * ```ts
 * readPath({ nested: { things: { here: 'value' } } }, 'nested.things.here')
 * // => 'value'
 *
 * readPath({ nested: { things: {} } }, 'nested.things.here')
 * // => null
 * ```
 *
 * @param object - The object to read from.
 * @param propertyPath - The path to read from, either as a string or an array of segments.
 *
 * @return The value at the specified path, or null if the path does not exist.
 */
export const readPath = (object: any, propertyPath: PropertyPath) => {
  return walkPath(object, propertyPath, null, (_parent, _propName, value) => value)
}

/**
 * Utility function for reading the closest value from a nested path on an object.
 * It will traverse the path and return the value of the last segment.
 * If the path does not exist, it will return null.
 *
 * ```ts
 * readClosest({ nested: { things: { here: 'value' } } }, 'nested.things.here')
 * // => 'value'
 *
 * readClosest({ nested: { things: {} } }, 'nested.things.here')
 * // => {}
 * ```
 *
 * @param object - The object to read from.
 * @param propertyPath - The path to read from, either as a string or an array of segments.
 *
 * @return The value at the closest segment of the specified path, or null if the path does not exist.
 */
export const readClosest = (object: any, propertyPath: PropertyPath) => {
  return walkPath(
    object,
    propertyPath,
    (node) => node,
    (_p, _pn, val) => val
  )
}

/**
 * Utility function for deleting a property at a nested path on an object.
 * If the path does not exist, it will do nothing.
 *
 * ```ts
 * deletePath({ nested: { things: { here: 'value' } } }, 'nested.things.here')
 * // => { nested: { things: {} } }
 *
 * deletePath({ nested: { things: {} } }, 'nested.things.here')
 * // => { nested: { things: {} } }
 * ```
 *
 * @param object - The object to delete from.
 * @param propertyPath - The path to delete from, either as a string or an array of segments.
 *
 * @return The modified object with the property deleted at the specified path.
 */
export const deletePath = (object: any, propertyPath: PropertyPath) => {
  return walkPath(object, propertyPath, null, (node, propName) => delete node[propName])
}

/**
 * Utility function for merging properties from multiple source objects into a target object.
 * It will overwrite properties in the target object with those from the sources,
 * but only if the property does not already exist in the target.
 * This is a left merge operation.
 *
 * ```ts
 * mergeLeft(
 *  { a: 1, b: 2 },
 *  { b: 3, c: 4 },
 *  { c: 5, d: 6 }
 * )
 * // => { a: 1, b: 3, c: 5, d: 6 }
 * ```
 * @param target - The target object to merge into.
 * @param sources - The source objects to merge from.
 *
 * @return The modified `target` object.
 */
export const mergeLeft = (target: any, ...sources: any) => {
  sources.forEach((obj: any) => {
    walk(obj, {
      onEnd: ({ path, value }) => writePath(target, path, value),
    })
  })

  return target
}
