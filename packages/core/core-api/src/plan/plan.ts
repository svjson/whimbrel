import { ExecutionStep } from '@src/execution'
import { FileSystemAccessMode } from '@src/fs'

/**
 * Describes a concrete Whimbrel plan.
 */
export interface ExecutionPlan {
  /**
   * Contains a tree structure of ExecutionStep, where the ExecutionPlan
   * itself serves as the "root node". Each ExecutionStep step may have
   * recursively contain 0-* child ExecutionSteps.
   */
  steps: ExecutionStep[]
  /**
   * Describes the effective FileSystemAccessMode of the plan as a whole.
   */
  fsMode: FileSystemAccessMode
}
