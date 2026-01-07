import { Actor, ActorRole } from '@src/actor'
import { WhimbrelContext } from '@src/context'
import { ExecutionStep } from '@src/execution'
import { ExecutionStepBlueprint } from '@src/plan'

/**
 * Describes the rules under which step augmentation may occur.
 */
export interface StepAugmentationRules {}

/**
 * Describes the a step with which to augment another step, in arbitrary
 * detail.
 */
export type StepAugmentation = ExecutionStepBlueprint & StepAugmentationRules

export interface StepAugmentationConditionParams {
  ctx: WhimbrelContext
  step: ExecutionStep
  actor?: Actor
}

export type StepAugmentationCondition = (
  params: StepAugmentationConditionParams
) => Promise<boolean>

export type StepAugmentationGenerator = (
  params: StepAugmentationConditionParams
) => Promise<StepAugmentation[]>

/**
 * Describes the augmentations available for a Task.
 */
export interface TaskAugmentation {
  condition?: StepAugmentationCondition
  steps: StepAugmentation[] | StepAugmentationGenerator
}

/**
 * Describes the Task augmentation configuration of a facet.
 */
export type TaskAugmentations = Record<string, TaskAugmentation>

/**
 * Get the concrete Actor referred to by ActorRole for the ExecutionStep
 * `step`.
 *
 * During materialization, the Actor may not yet have been determined, in
 * which case this function returns `undefined`
 *
 * @param ctx - The WhimbrelContext in which to resolve the Actor
 * @param step - The ExecutionStep for which to resolve the Actor
 * @param actorRole - The ActorRole to resolve
 */
export const resolveStepActorRole = (
  ctx: WhimbrelContext,
  step: ExecutionStep,
  actorRole: ActorRole
): Actor | undefined => {
  if (step.inputs[actorRole]) return step.inputs[actorRole]

  if (step.meta?.resolvedParameters?.[actorRole]?.actorId) {
    return ctx.getActor(step.meta?.resolvedParameters?.[actorRole]?.actorId)
  }
}
