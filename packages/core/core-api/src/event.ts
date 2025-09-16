import { ExecutionStep } from './execution'
import { VCSFileEntry, VCSMutation } from './vcs'

/**
 * Event-types concerning the step execution lifecycle.
 */
export type StepEventType =
  | 'event:step:execution-initiated'
  | 'event:step:execution-completed'

/**
 * Event-types concerning VCS operations.
 */
export type VCSEventType = 'event:vcs:generic' | 'event:vcs:commit'

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
 * facet has performed a generic/unspecified operation
 */
export const EVENT__VCS_GENERIC: VCSEventType = 'event:vcs:generic' as const

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

export interface VCSEventDetails {
  vcs: string
  repository: string
  branch?: string
  hash?: string
  message?: string
  files: VCSFileEntry[]
  author?: {
    name: string
    email?: string
  }
}

export interface VCSEvent {
  type: 'vcs'
  eventType: VCSEventType
  details: VCSEventDetails
}

/**
 * Base type for events on the Whimbrel event bus.
 */
export type WhimbrelEvent = StepEvent | VCSEvent

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

/**
 * Factory-function or VCSEvent
 */
export function makeVCSEvent(eventType: VCSEventType, details: VCSEventDetails): VCSEvent
export function makeVCSEvent(mutation: VCSMutation): VCSEvent
export function makeVCSEvent(
  arg0: VCSEventType | VCSMutation,
  details?: VCSEventDetails
): VCSEvent {
  let eventType: VCSEventType = 'event:vcs:generic'
  if (typeof arg0 !== 'string') {
    const mutation: VCSMutation = arg0
    if (mutation.type === 'commit') {
      eventType = EVENT__VCS_COMMIT
      details = {
        vcs: mutation.vcs,
        repository: mutation.repository,
        files: mutation.changeset,
      }
    }
  } else {
    eventType = arg0
  }

  return {
    type: 'vcs',
    eventType,
    details,
  }
}
