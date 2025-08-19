import { Actor, ActorType } from './actor'
import { WhimbrelContext } from './context'
import { WhimbrelError } from './core'
import { FileSystemMutation } from './fs'
import { VCSMutation } from './vcs'

/**
 * Enum-type for mutations.
 */
export type MutationType = 'create' | 'delete' | 'modify'

/**
 * Describes a significant mutation of the WhimbrelContext
 */
export interface ContextMutation {
  mutationType: 'ctx'
  type: ContextMutationType
  path: string
  key: string
}

/**
 * Base-type for all types of mutations.
 */
export type Mutation = FileSystemMutation | ContextMutation | VCSMutation

/**
 * Enum-type for Context mutations.
 */
export type ContextMutationType = 'set' | 'add'

/**
 * Actions for Actor Context mutations.
 */
type ActorAction = 'add' | 'set'

/**
 *
 */
export type AcceptMutationHandler = (mutation: Mutation) => void

export const defaultMutationHandler = (ctx: WhimbrelContext): AcceptMutationHandler => {
  return (mutation: Mutation) => {
    const { stepResult } = ctx
    if (stepResult) {
      switch (mutation.mutationType) {
        case 'ctx':
          stepResult.mutations[mutation.mutationType].push(mutation)
          break
        case 'fs':
          stepResult.mutations[mutation.mutationType].push(mutation)
          break
        case 'vcs':
          stepResult.mutations[mutation.mutationType].push(mutation)
          break
      }
    }
  }
}

/**
 * Validate an attempted Actor operation.
 *
 * @param ctx - The WhimbrelContext in which the operation is being performed.
 * @param type - The type of Actor being operated on ('source', 'target', or 'rootTarget').
 * @param action - The action being performed ('add' or 'set').
 * @param actor - The Actor object or string reference being operated on.
 * @return The validated Actor object.
 */
const validateActorOperation = (
  ctx: WhimbrelContext,
  type: ActorType,
  action: ActorAction,
  actor: Actor | string
): Actor => {
  if (typeof actor === 'string' && action === 'add') {
    throw new WhimbrelError(`Cannot add actor by string reference.`)
  }

  if (typeof actor === 'string') {
    const actorName = actor
    actor = (type === 'source' ? ctx.sources : ctx.targets)[actor]
    if (!actor) {
      throw new WhimbrelError(`No ${type} with name '${actorName}' has been defined.`)
    }
  }

  if (!actor || !actor.name) {
    throw new WhimbrelError(`Invalid ${type}: ${JSON.stringify(actor)}`)
  }

  if (action === 'add' && (type === 'source' ? ctx.sources : ctx.targets)[actor.name]) {
    throw new WhimbrelError(`Argument ${type} already defined: '${actor.name}'`)
  }

  return actor
}

/**
 * Convenience wrapper for performing context mutations.
 */
export class ContextMutator {
  constructor(private ctx: WhimbrelContext) {}

  /**
   * Add/register a new Source Actor in the Whimbrel Context.
   *
   * This will add the Actor to the `ctx.sources` map and
   * record the mutation in the current step result.
   *
   * @param source - The Actor to add.
   */
  addSource(source: Actor) {
    const validated = validateActorOperation(this.ctx, 'source', 'add', source)
    this.ctx.sources[validated.name] = validated
    this.ctx.acceptMutation({
      mutationType: 'ctx',
      type: 'add',
      path: 'source',
      key: validated.name,
    })
  }

  /**
   * Add/register a new Target Actor in the Whimbrel Context.
   *
   * This will add the Actor to the `ctx.targets` map and
   * record the mutation in the current step result.
   *
   * @param target - The Actor to add.
   */
  addTarget(target: Actor) {
    const validated = validateActorOperation(this.ctx, 'target', 'add', target)
    this.ctx.target[validated.name] = validated
    this.ctx.acceptMutation({
      mutationType: 'ctx',
      type: 'add',
      path: 'target',
      key: validated.name,
    })
  }

  /**
   * Set the current Source Actor in the Whimbrel Context.
   *
   * This will set the `ctx.source` property to the specified Actor
   * or string reference, validating it against the existing
   * source Actors in the context.
   *
   * @param source - The Actor or string reference to set as the current source.
   *
   * @return void
   */
  setSource(source: Actor | string) {
    const validated = validateActorOperation(this.ctx, 'source', 'set', source)
    this.ctx.source = validated
    this.ctx.acceptMutation({
      mutationType: 'ctx',
      type: 'set',
      path: 'source',
      key: validated.name,
    })
  }

  /**
   * Set the current Target Actor in the Whimbrel Context.
   *
   * This will set the `ctx.target` property to the specified Actor
   * or string reference, validating it against the existing
   * target Actors in the context.
   *
   * @param target - The Actor or string reference to set as the current target.
   *
   * @return void
   */
  setTarget(target: Actor | string) {
    const validated = validateActorOperation(this.ctx, 'target', 'set', target)
    this.ctx.target = validated
    this.ctx.acceptMutation({
      mutationType: 'ctx',
      type: 'set',
      path: 'target',
      key: validated.name,
    })
  }

  /**
   * Set the root target Actor in the Whimbrel Context.
   *
   * This will set the `ctx.rootTarget` property to the specified Actor
   * or string reference, validating it against the existing
   * target Actors in the context.
   *
   * @param target - The Actor or string reference to set as the root target.
   * @return void
   */
  setRootTarget(target: Actor | string) {
    const validated = validateActorOperation(this.ctx, 'rootTarget', 'set', target)
    this.ctx.rootTarget = validated
    this.ctx.acceptMutation({
      mutationType: 'ctx',
      type: 'set',
      path: 'rootTarget',
      key: validated.name,
    })
  }
}
