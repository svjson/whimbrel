import { writePath } from './path'
import { walk } from './walk'

export interface MergeOptions {
  sources: any[]
  ignoreUndefined?: boolean
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
export function mergeLeft(target: any, ...sources: any): any
export function mergeLeft(target: any, opts: MergeOptions): any

export function mergeLeft(target: any, ...rest: any[]) {
  const opts: MergeOptions =
    rest.length === 1 && Array.isArray(rest[0]?.sources) ? rest[0] : { sources: rest }

  opts.sources.forEach((obj: any) => {
    if (obj === undefined) return
    walk(obj ?? {}, {
      onEnd: ({ path, value }) => {
        if (!opts.ignoreUndefined || value !== undefined) writePath(target, path, value)
      },
    })
  })

  return target
}
