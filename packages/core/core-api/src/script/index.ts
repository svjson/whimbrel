export interface ScriptIntentBase<T extends ScriptIntentTarget> {
  op: string
  kind: string
  target: T
}

export interface ScriptIntentTarget {
  type: string
  module?: string
}

export interface ExecuteIntent extends ScriptIntentBase<ExecuteIntentTarget> {
  op: 'execute'
  id: string
}

export interface BaseCompositeIntent extends ScriptIntentBase<undefined> {
  op: 'composite'
  intents: ScriptIntent[]
}

export interface CompositeAndIntent extends BaseCompositeIntent {
  kind: 'and'
}

export interface CompositeOrIntent extends BaseCompositeIntent {
  kind: 'or'
}

export interface ExecuteIntentTarget extends ScriptIntentTarget {}

export interface PublishIntent extends ScriptIntentBase<PublishIntentTarget> {
  op: 'publish'
}

export interface PublishIntentTarget extends ScriptIntentTarget {
  flags: {
    accessType: 'public' | 'private'
  }
}

export type ScriptIntent =
  | ExecuteIntent
  | PublishIntent
  | CompositeAndIntent
  | CompositeOrIntent

export interface ScriptDescription {
  /**
   * A brief human-readable summary of the node's purpose.
   */
  summary?: string
  /**
   * Detailed and structured information about the node and its semantic
   * intent.
   */
  intent?: ScriptIntent
}
