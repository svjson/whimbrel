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
    const actorId = actor
    actor = ctx.getActor(actor, type)
    if (!actor) {
      throw new WhimbrelError(`No ${type} with id '${actorId}' has been defined.`)
    }
  }

  if (!actor || !actor.name) {
    throw new WhimbrelError(`Invalid ${type}: ${JSON.stringify(actor)}`)
  }

  if (action === 'add' && ctx.getActor(actor.id, type)) {
    throw new WhimbrelError(`Argument ${type} already defined: '${actor.id}'`)
  }

  return actor
}

type MutableArrayKeys<T> = {
  [P in keyof T]-?: NonNullable<T[P]> extends Array<any> ? P : never
}[keyof T]

type Elem<T, K extends keyof T> = NonNullable<T[K]> extends Array<infer U> ? U : never

/**
 * Convenience wrapper for performing context mutations.
 */
export class ContextMutator {
  constructor(private ctx: WhimbrelContext) {}

  /**
   * Set a property of an actor and report the mutation.
   *
   * @param actor - The Actor whose property is to be set.
   * @param property - The property of the Actor to set.
   * @param value - The value to set the property to.
   */
  setActorProperty<K extends keyof Actor>(
    actor: Actor,
    property: K,
    value: Actor[K]
  ): void {
    actor[property] = value
    this.ctx.acceptMutation({
      mutationType: 'ctx',
      type: 'set',
      // TODO: Change this to an actual object path
      path: `actor:${actor.id}.${property}`,
      key: String(value),
    })
  }

  addActorElement<K extends MutableArrayKeys<Actor>>(
    actor: Actor,
    property: K,
    value: Elem<Actor, K>
  ) {
    const array = (actor[property] ??= [] as unknown as NonNullable<Actor[K]>)

    ;(array as Array<Elem<Actor, K>>).push(value)
    this.ctx.acceptMutation({
      mutationType: 'ctx',
      type: 'add',
      // TODO: Change this to an actual object path
      path: `actor:${actor.id}.${property}`,
      key: String(value),
    })
  }

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
    this.ctx.sources[validated.id] = validated
    this.ctx.acceptMutation({
      mutationType: 'ctx',
      type: 'add',
      path: 'sources',
      key: validated.id,
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
    this.ctx.targets[validated.id] = validated
    this.ctx.acceptMutation({
      mutationType: 'ctx',
      type: 'add',
      path: 'targets',
      key: validated.id,
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
    if (this.ctx.source?.id === validated.id) return
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
    if (this.ctx.target?.id === validated.id) return
    this.ctx.target = validated
    this.ctx.acceptMutation({
      mutationType: 'ctx',
      type: 'set',
      path: 'target',
      key: validated.id,
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
      key: validated.id,
    })
  }
}
