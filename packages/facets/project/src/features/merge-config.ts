import { ProjectConfig } from '@src/types'
import { mergeLeft } from '@whimbrel/walk'
import { pushUnique } from '@whimbrel/array'
import { MergeConfigFunction } from '@whimbrel/core-api'

export const mergeConfig: MergeConfigFunction<ProjectConfig> = (
  a: ProjectConfig,
  b: ProjectConfig
): ProjectConfig => {
  const merged = mergeLeft({}, a, b) as ProjectConfig

  if (Array.isArray(merged.subModules)) {
    merged.subModules = []
    pushUnique(merged.subModules, ...[...(a.subModules ?? []), ...(b.subModules ?? [])])
  }

  return merged
}
