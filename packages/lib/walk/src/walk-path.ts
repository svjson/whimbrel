import type { PropertyPath } from './types'

/**
 * Mutator handler-function for `walkPath` that is invoked when following the
 * property path is cut short by an missing/undefined value.
 *
 * This enables the option to "correct" the situation by creating the value,
 * to allow the walking to continue.
 *
 * Should explicitly return `true` to indicate that the walk should be aborted.
 * Any non-truthy return value - or the lack of one - indicates that it's safe
 * to continue walking.
 */
export type OnNodeMissingMutator = (
  /**
   * The parent object that is currently missing the `key` property, or has a
   * null/undefined value.
   */
  object: any | undefined,
  /**
   * They key whose value is missing.
   */
  key: string | undefined,
  /**
   * The full path to `object`, excluding `key`
   */
  path: string[]
) => boolean | undefined | void

/**
 * Mutator handler-function for the target node - the final part of the path - of
 * `walkPath`.
 */
export type NodeTargetMutator = (
  /**
   * The parent of the target value, e.g, the last-but-one part of the property path.
   */
  object: any,
  /**
   * The key of the target value, e.g, the last part of the property path.
   */
  key: string,
  /**
   * The value associated with `key`, if any.
   */
  value?: any
) => boolean | undefined | void

/**
 * Walk `object` recursively along a path specified by `propertyPath`,
 * and perform operation `op` on the last node/segment, e.g,
 *
 * ```ts
 * walkPath(
 *  obj,
 *  'node.workspaces.apps',
 *  null,
 *  (obj, seg, val) => obj[seg] = n.toLowerCase()
 * );
 * ```
 *
 * or
 *
 * ```ts
 * walkPath(
 *  obj,
 *  ['node', 'workspaces', 'apps'],
 *  null,
 *  (obj, seg, val) => obj[seg] = n.toLowerCase()
 * );
 * ```
 *
 * If `onMissing` is provided, it will be called when a segment is missing,
 * given the opportunity to mutate the object to ensure the path.
 *
 * @param object - The object to walk.
 * @param propertyPath - The path to walk, either as a string or an array of segments.
 * @param onMissing - Optional function to call when a segment is missing.
 * @param op - Optional operation to perform on the last segment.
 *
 * @return The result of the operation on the last segment, or undefined if no operation is provided.
 */
export const walkPath = (
  object: any,
  propertyPath: PropertyPath,
  onMissing?: OnNodeMissingMutator,
  op?: NodeTargetMutator,
  traversed: string[] = []
): any => {
  const parts: string[] =
    typeof propertyPath === 'string' ? propertyPath.split('.') : [...propertyPath]

  const seg: string = parts.shift()

  if (parts.length === 0) {
    if (op) {
      return op(object, seg, object[seg])
    }
    return
  }

  let nextObj = object[seg]
  if (!nextObj) {
    if (onMissing) {
      const miss = onMissing(object, seg, traversed)
      if (miss) {
        return miss
      }
      nextObj = object[seg]
    }

    if (!nextObj) {
      return
    }
  }
  traversed.push(seg)
  return walkPath(nextObj, parts, onMissing, op, traversed)
}
