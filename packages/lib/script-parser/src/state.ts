import { Grammar } from './types'

/**
 * A parser grammar state machine.
 */
export type ParserStateMachine<G extends Grammar> = {
  /**
   * The initial state of the parser grammar.
   */
  initial: State<G>
  /**
   * Named states of the parser grammar.
   */
  [key: string]: State<G>
}

/**
 * A transition between states in the parser grammar state machine
 *
 * @template G - The grammar type
 */
export interface Transition<G extends Grammar> {
  /**
   * Require a token to be of this type to allow this transition to
   * be selected.
   */
  token?: string | string[]
  /**
   * Require the text of a token to equal this string to allow this
   * transition to be selected.
   */
  text?: string | string[]
  /**
   * Determines if the evaluated token that resulted in this transition
   * being selected should be ignored.
   */
  ignore?: boolean
  /**
   * Trigger an emit-event of this type when transition has been fully
   * processed.
   */
  emit?: G['Emittable']
  /**
   * Trigger a wrap-event of this type when the transitation is being
   * evaluated.
   */
  wrap?: G['Wrappable']
  /**
   * Modify the current context when this transition is selected by
   * either pushing a named state or popping the current state.
   */
  context?: ['push', string] | ['pop']
  /**
   * Determines if the completion of this transition should cause
   * the emitter to collect the current node.
   */
  collect?: boolean
  /**
   * The target state of this transition. Either inline, or a named
   * state in the parser grammar state machine.
   */
  state: string | State<G>
}

/**
 * Describes actions to be taken in case no transition is taken due
 * to the end of input tokens having been reached.
 */
export interface EndState<Emittable> {
  /**
   * Trigger an emit-event.
   */
  emit?: Emittable
}

/**
 * Describes a State of the parser grammar state machine.
 */
export interface State<G extends Grammar> {
  /**
   * Actions to be taken when the end of input tokens is reached.
   */
  end?: EndState<G['Emittable']>
  /**
   * Possible transitions from this state.
   */
  transitions: Transition<G>[]
}
