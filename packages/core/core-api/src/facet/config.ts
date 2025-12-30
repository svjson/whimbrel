/**
 * Function type for facet configuration merging functions.
 *
 * Facet implementations may provide a function that merges two
 * configuration objects for the facet.
 *
 * This is used when multiple declarations of the same facet
 * are present, and their configurations need to be merged into
 * a single configuration object.
 *
 * @param a The first configuration object
 * @param b The second configuration object
 */
export type MergeConfigFunction<T = any> = (a: T, b: T) => T
