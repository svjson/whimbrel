import equal from 'fast-deep-equal'

/**
 * Concat any number of arrays of primitive values to the end of
 * `array`, but append only values not already present.
 *
 * This is useful for merging arrays while ensuring
 * no duplicates are introduced.
 *
 * "Primitive values" refers to anything that can be compared using
 * a check with ===.
 *
 * @param array - The target array to which values will be added.
 * @param arrays - One or more arrays to be concatenated.
 * @return The modified target array with unique values.
 */
export const concatDistinct = (array: any[], ...arrays: any[][]) => {
  arrays.forEach((a) => {
    array.push(...a.filter((v: any) => !array.includes(v)))
  })
  return array
}

/**
 * Concat any number of arrays of objects to the end of `array`,
 * but only append values not already present.
 *
 * This is useful for merging arrays while ensuring
 * no duplicates are introduced.
 *
 * Objects refers to anything that requires a deep equals/structure
 * inspection to determine equality.
 *
 * @param array - The target array to which values will be added.
 * @param arrays - One or more arrays to be concatenated.
 * @return The modified target array with unique values.
 */
export const concatUnique = (array: any[], ...arrays: any[][]) => {
  arrays.forEach((a) => {
    array.push(...a.filter((v: any) => !array.find((e) => equal(e, v))))
  })
  return array
}
