import { readPath } from './path'
import { walk } from './walk'

export type DiffType = 'add' | 'remove' | 'modify'

export type Diff3WayType = 'add' | 'remove' | 'modify' | 'unchanged'

/**
 * An entry representing a difference between two objects.
 */
export interface DiffEntry {
  /**
   * The type of change: 'add', 'remove' or 'modify'.
   */
  type: DiffType
  /**
   * The path to the property that has changed.
   */
  path: string[]
  /**
   * The value of the property in `self` (the first object).
   */
  self?: any
  /*
   * The value of the property in `other` (the second object).
   */
  other?: any
}

/**
 * An entry representing a three-way difference between two objects and a base object.
 */
export interface Diff3WayEntry {
  /**
   * The types of changes in `a` and `b` compared to `base`.
   */
  types: [Diff3WayType, Diff3WayType]
  /**
   * The path to the property that has changed.
   */
  path: string[]
  /**
   * Whether there is a conflict between the changes in `a` and `b`.
   */
  conflict?: boolean
  /**
   * The value of the property in `a`.
   */
  a?: any
  /**
   * The value of the property in `b`.
   */
  b?: any
  /**
   * The value of the property in `base`.
   */
  base?: any
}

/**
 * Compute the difference between two objects and return a list of changes.
 * A change can be of type 'add', 'remove' or 'modify'.
 * - 'add' means the property was added in `obj` that does not exist in `other`.
 * - 'remove' means the property was removed from `obj` that exists in `other`.
 * - 'modify' means the property exists in both `obj` and `other` but have different values.
 *
 * The path to the property is represented as an array of strings.
 *
 * Example:
 * ```ts
 * const obj = {
 *  a: 1,
 *  b: 2,
 *  c: {
 *    d: 4
 *  }
 * }
 * const other = {
 *  a: 1,
 *  b: 3,
 *  e: 5
 * }
 * diff(obj, other)
 * // => [
 * //  { type: 'modify', path: ['b'], self: 2, other: 3 },
 * //  { type: 'remove', path: ['e'], other: 5 },
 * //  { type: 'add', path: ['c'], self: { d: 4 } }
 * // ]
 * ```
 *
 * @param obj The first object to compare.
 * @param other The second object to compare.
 *
 * @return An array of DiffEntry objects representing the changes.
 */
export const diff = (obj: any, other: any): DiffEntry[] => {
  const diffEntries: DiffEntry[] = []

  walk(obj, {
    onEnd: ({ path, value }) => {
      const baseVal = readPath(other, path)
      if (baseVal === undefined) {
        diffEntries.push({
          type: 'add',
          path: [...path],
          self: value,
        })
      } else if (value !== baseVal) {
        diffEntries.push({
          type: 'modify',
          path: [...path],
          self: value,
          other: baseVal,
        })
      }
    },
  })

  walk(other, {
    onEnd: ({ path, value }) => {
      const objVal = readPath(obj, path)
      if (objVal === undefined) {
        diffEntries.push({
          type: 'remove',
          path: [...path],
          other: value,
        })
      }
    },
  })

  return diffEntries
}

/**
 * Compute a three-way diff between two objects `a` and `b` with a common base object `base`.
 * This function identifies changes in both `a` and `b` compared to `base`, and detects conflicts where both `a` and `b` have made different changes to the same property.
 * The result is an array of `Diff3WayEntry` objects, each representing a property that has changed in either `a` or `b` compared to `base`.
 *
 * Example:
 * ```ts
 * const base = { a: 1, b: 2 }
 * const a = { a: 1, b: 3 } // 'b' modified
 * const b = { a: 4, b: 2 } // 'a' modified
 * diff3Way(a, b, base)
 * // => [
 * //  {
 * //    types: ['unchanged', 'modify'],
 * //    path: ['a'],
 * //    base: 1,
 * //    a: 1,
 * //    b: 4,
 * //    conflict: false
 * //  },
 * //  {
 * //    types: ['modify', 'unchanged'],
 * //    path: ['b'],
 * //    base: 2,
 * //    a: 3,
 * //    b: 2,
 * //    conflict: false
 * //  }
 * // ]
 * ```
 *
 * @param a - The first object to compare.
 * @param b - The second object to compare.
 * @param base - The common base object to compare against.
 *
 * @return An array of `Diff3WayEntry` objects representing the changes and conflicts.
 */
export const diff3Way = (a: any, b: any, base: any): Diff3WayEntry[] => {
  const diffEntries: Diff3WayEntry[] = []

  const aDiff = diff(a, base)
  const bDiff = diff(b, base)

  const allPaths = new Set([...aDiff, ...bDiff].map((d) => d.path.join('\x1E')))

  for (const key of allPaths) {
    const path = key.split('\x1E')
    const aEntry = aDiff.find((d) => d.path.join('\x1E') === key)
    const bEntry = bDiff.find((d) => d.path.join('\x1E') === key)

    diffEntries.push({
      path,
      types: [aEntry?.type ?? 'unchanged', bEntry?.type ?? 'unchanged'],
      base: readPath(base, path),
      a: readPath(a, path),
      b: readPath(b, path),
      conflict: Boolean(
        aEntry && bEntry && (aEntry.type !== bEntry.type || aEntry.self !== bEntry.other)
      ),
    })
  }

  return diffEntries
}
