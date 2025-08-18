import { ExecutionStep } from './execution'

/**
 * Event-types concerning the step execution lifecycle.
 */
export type StepEventType =
  | 'event:step:execution-initiated'
  | 'event:step:execution-completed'

/**
 * Event-types concerning VCS operations.
 */
export type VCSEventType = 'event:vcs:commit'

/**
 * Enum-type for event type IDs.
 */
export type EventType = StepEventType | VCSEventType

/**
 * Identifier/Event-type for events emitted when the execution of
 * a step is about to begin.
 */
export const EVENT__STEP_EXECUTION_INITIATED: StepEventType =
  'event:step:execution-initiated' as const

/**
 * Identifier/Event-type for events emitted once the execution of
 * a step is fully completed.
 */
export const EVENT__STEP_EXECUTION_COMPLETED: StepEventType =
  'event:step:execution-completed' as const

/**
 * Identifier/Event-type for events emitted when a version control
 * facet has made a commit in the source tree.
 */
export const EVENT__VCS_COMMIT: VCSEventType = 'event:vcs:commit' as const

/**
 * Structure of events concering the step execution lifecycle.
 */
export interface StepEvent {
  type: 'step'
  eventType: StepEventType
  details: {
    step: ExecutionStep
  }
}

/**
 * Base type for events on the Whimbrel event bus.
 */
export type WhimbrelEvent = StepEvent

/**
 * Factory-function for StepEvent.
 */
export const makeStepEvent = (
  eventType: StepEventType,
  step: ExecutionStep
): StepEvent => {
  return {
    type: 'step',
    eventType,
    details: {
      step,
    },
  }
}
