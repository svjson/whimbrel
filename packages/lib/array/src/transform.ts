/**
 * Juxtaposes any number of arrays, creating a new array where each element
 * is an array of the positional values from each of the source arrays.
 *
 * If the arrays are of unequal length, the resulting array will have the length
 * of the longest array, with `undefined` filling in for missing values from the
 * shorter arrays.
 *
 * Example:
 * ```ts
 * juxt(['one', 'two', 'three'], ['ein', 'zwei', 'drei'])
 * // => [['one', 'ein'], ['two', 'zwei'], ['three', 'drei']]
 * ```
 *
 * @param arrays - The arrays to juxtapose.
 *
 * @return A new array of juxtaposed values.
 */
export const juxt = <T extends readonly unknown[][]>(...arrays: T) =>
  Array.from(
    { length: Math.max(...arrays.map((a) => a.length)) },
    (_, i) => arrays.map((a) => a[i]) as { [K in keyof T]: T[K][number] }
  )


/**
 * Left-pads an array with `undefined` values to reach a specified maximum length.
 *
 * If the array is already at or above the specified length, it is returned unchanged.
 *
 * Example:
 * ```ts
 * leftPad(['a', 'b', 'c'], 5)
 * // => [undefined, undefined, 'a', 'b', 'c']
 *
 * const [actorId, facetId, taskId] = leftPad(segments, 3)
 * ```
 */
export const leftPad = (array: any[], maxLength: number) => {
  return [...Array(maxLength - array.length).fill(undefined), ...array]
}
