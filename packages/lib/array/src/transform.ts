/**
 * Juxtaposes two arrays, creating a new array where each element is an array of
 * the positional values from each of the source arrays.
 *
 * If the arrays are of unequal length, the resulting array will have the length
 * of the longer array, with `undefined` filling in for missing values from the
 * shorter array.
 *
 * Example:
 * ```ts
 * juxt(['one', 'two', 'three'], ['ein', 'zwei', 'drei'])
 * // => [['one', 'ein'], ['two', 'zwei'], ['three', 'drei']]
 * ```
 *
 * @param arr1 - The first array.
 * @param arr2 - The second array.
 *
 * @return A new array of juxtaposed values.
 */
export const juxt = <TypeA, TypeB>(arr1: TypeA[], arr2: TypeB[]): [TypeA, TypeB][] =>
  Array.from({ length: Math.max(arr1.length, arr2.length) }, (_, i) => [arr1[i], arr2[i]])
