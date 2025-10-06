export { walkPath } from './walk-path'
export { walk } from './walk'
export { closestAncestor, readPath, writePath, deletePath, readClosest } from './path'
export { diff, diff3Way } from './diff'
export { mergeLeft } from './merge'
export { propertyPaths, containsAll } from './query'
export { resolve, resolveWithMetadata, resolvePlaceholderValue } from './resolve'

export type { OnNodeMissingMutator } from './walk-path'
export type { OnEachMutator, OnEndMutator } from './walk'
export type { DiffEntry, Diff3WayEntry } from './diff'
export type { PropertyPath } from './types'
export type {
  Resolution,
  LiteralResolution,
  ReferenceResolution,
  PlaceholderResolution,
  ConcatResolution,
} from './resolve'
