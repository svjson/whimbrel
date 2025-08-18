import equal from 'fast-deep-equal'

/**
 * Push any number of primitive values to the end of an array,
 * provided that they are not already present.
 *
 * This is useful for ensuring that the array contains only unique values,
 * without introducing duplicates and without cumbersome if/includes checks.
 *
 * "Primitive values" refers to anything that can be compared using
 * a check with ===.
 *
 * @param array - The target array to which values will be added.
 * @param values - One or more values to be pushed to the array.
 *
 * @return The modified target array with unique values.
 */
export const pushDistinct = <T>(array: T[], ...values: T[]) => {
  values.forEach((value) => {
    if (!array.includes(value)) {
      array.push(value)
    }
  })
}

/**
 * Push any number of objects to the end of an array,
 * provided that they are not already present.
 *
 * This is useful for ensuring that the array contains only unique objects,
 * without introducing duplicates and without cumbersome if/find/some checks.
 *
 * Objects refers to anything that requires a deep equals/structure
 * inspection to determine equality.
 *
 * @param array - The target array to which values will be added.
 * @param values - One or more objects to be pushed to the array.
 *
 * @return The modified target array with unique values.
 */
export const pushUnique = <T>(array: T[], ...values: T[]) => {
  values.forEach((value) => {
    if (!array.some((e) => equal(e, value))) {
      array.push(value)
    }
  })
}
