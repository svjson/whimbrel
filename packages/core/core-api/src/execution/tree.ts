/**
 * Enum-type or TreeState.state
 */
export type TreeNodeState = 'default' | 'satisfied' | 'error'

/**
 * Describes the "state" of an ExecutionStep in the Execution tree.
 */
export interface TreeState {
  state: TreeNodeState
  reason?: string
}
