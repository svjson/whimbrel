import { TurboJSON } from '@src/adapters/turbo.json-adapter'
import { WhimbrelContext } from '@whimbrel/core-api'

export type TaskNode = {
  name: string
  dependsOn: string[]
  config: Record<string, unknown>
}

export type TaskTree = Record<string, TaskNode>

/**
 * Read the task tree from a turbo.json file
 */
export const readTaskTree = (turboJson: TurboJSON) => {
  const tasks: TaskTree = {}

  for (const [name, cfg] of Object.entries(turboJson.get('tasks'))) {
    tasks[name] = {
      name,
      dependsOn: cfg.dependsOn ?? [],
      config: cfg,
    }
  }

  return tasks
}

export const getTaskDependencies = (
  tree: TaskTree,
  task: string,
  seen = new Set<string>()
): string[] => {
  if (seen.has(task)) return []
  seen.add(task)

  const node = tree[task]
  if (!node) return []

  let deps: string[] = []
  for (const dep of node.dependsOn) {
    // You could strip off "^" here if you want generic vs package-level clarity
    const clean = dep // .replace(/^\^/, '')
    deps.push(clean, ...getTaskDependencies(tree, clean, seen))
  }
  return Array.from(new Set(deps))
}
