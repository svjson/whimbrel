/**
 * Function signature for onEach-handler functions of `walk`.
 */
export type OnEachMutator = (opts: {
  path: string[]
  value: any
  firstSibling: boolean
  lastSibling: boolean
}) => void

/**
 * Function signature for onEnd-handler functions of `walk`.
 */
export type OnEndMutator = (opts: { path: string[]; value: any }) => void

/**
 * Parameters for the `walk` function.
 */
export interface WalkParams {
  /**
   * The current path of the walk. Should typically not be provided in external
   * invocations of `walk`.
   */
  path?: string[]
  /**
   * Optional function to invoke for each traversed node. This function may have
   * side effects and/or mutate the node itself.
   */
  onEach?: OnEachMutator
  /**
   * Optional function to invoke at each "leaf" node. This function may have
   * side effects and/or mutate the node itself."
   */
  onEnd?: OnEndMutator
  /**
   * Indicates whether the traversed node is the first sibling of its parent.
   */
  firstSibling?: boolean
  /**
   * Indicates whether the traversed node is the last sibling of its parent.
   */
  lastSibling?: boolean
}

/**
 * Recursively walk all nodes of an object, optionally executing a function
 * at each node.
 *
 * This function will traverse the object and call `onEach` for each node,
 * passing the current path and value of the node.
 *
 * If `onEnd` is provided, it will be called for each node when the
 * traversal ends, passing the path and value of the node.
 *
 * The `path` is an array of strings representing the path to the current node,
 * and `firstSibling` and `lastSibling` are boolean flags indicating
 * whether the current node is the first or last sibling in its parent object.
 *
 * @param object - The object to walk.
 * @param params - An object containing the parameters for the walk.
 * @param params.onEach - A function to call for each node, receiving the current path and value.
 * @param params.onEnd - A function to call when the traversal ends for each node, receiving the path and value.
 * @param params.path - An array of strings representing the current path to the node.
 * @param params.firstSibling - A boolean indicating if the current node is the first sibling in its parent object.
 * @param params.lastSibling - A boolean indicating if the current node is the last sibling in its parent object.
 *
 * @return void
 */
export const walk = (
  object: any,
  { onEach, onEnd, path = [], firstSibling, lastSibling }: WalkParams
) => {
  if (typeof onEach === 'function') {
    onEach({ path, value: object, firstSibling, lastSibling })
  }

  if (
    object !== null &&
    typeof object === 'object' &&
    Object.getPrototypeOf(object) === Object.prototype
  ) {
    const objKeys = Object.keys(object)
    objKeys.forEach((k, i) => {
      walk(object[k], {
        onEach,
        onEnd,
        path: [...path, k],
        firstSibling: i === 0,
        lastSibling: i === objKeys.length - 1,
      })
    })
  } else if (typeof onEnd === 'function') {
    onEnd({ path, value: object })
  }
}
