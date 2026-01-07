import path from 'node:path'
import {
  ActorRole,
  FacetModule,
  makeFacetModule,
  makeTask,
  moduleTasks,
  resolveStepActorRole,
  StepAugmentation,
  Task,
  TaskAugmentation,
  TaskAugmentations,
  TaskId,
} from '@whimbrel/core-api'
import { ExecutionStep } from '@src/index'

/**
 * Converts a tree of ExecutionSteps into a nested array structure,
 * practical for asserts/expectations.
 *
 * @param steps - The execution steps to convert.
 *
 * @return The nested array representation of the execution steps.
 */
export const toArrayTree = (steps: ExecutionStep[]) => {
  return steps.map((s) => [s.id, ...toArrayTree(s.steps)])
}

export const extractTreeStructure = (steps: ExecutionStep[]) => {
  return steps.map(extractStepStructure)
}

export const extractStepStructure = (step: ExecutionStep) => {
  return {
    id: step.id,
    ...(step.steps.length ? { steps: extractTreeStructure(step.steps) } : {}),
  }
}

/**
 * Builder for creating generic test facets
 */
type TestFacetBuilder = {
  id(id: string): TestFacetBuilder
  tasks(...tasks: (string | Task)[]): TestFacetBuilder
  augmentationFor(taskId: string, aug: (b: AugmentationBuilder) => void): TestFacetBuilder
  build(): FacetModule
}

/**
 * Create a TestFacetBuilder.
 */
export const testFacetBuilder = (testFacetId?: string): TestFacetBuilder => {
  let facetId: string = testFacetId ?? 'test-dummy'
  let facetTasks: Task[] = []
  const taskAugs: TaskAugmentations = {}

  return {
    /**
     * Override default or original facet ID.
     *
     * @param id - The new facet ID.
     *
     * @return The builder instance.
     */
    id(id: string): TestFacetBuilder {
      facetId = id
      return this
    },

    /**
     * Add tasks to the facet.
     *
     * Arguments may be a string (the ID of the task) for generic tasks that
     * serves no other purpose than "being there", or a complete Task instance.
     *
     * @param tasks - The tasks to add, either as strings (IDs) or Task objects.
     *
     * @return The builder instance.
     */
    tasks(...tasks: (string | Task)[]): TestFacetBuilder {
      facetTasks.push(
        ...tasks.map((t) =>
          typeof t === 'string' ? makeTask({ id: `${facetId}:${t}` }) : t
        )
      )
      return this
    },

    /**
     * Appends a StepAugmentationGenerator using a lambda that provides
     * an AugmentationBuilder.
     *
     * @param taskId - The ID of the task to augment.
     * @param aug - Lambda that receives an AugmentationBuilder and is expected
     *              to provide the augmentation details.
     *
     * @return The builder instance.
     */
    augmentationFor(
      taskId: string,
      aug: (aug: AugmentationBuilder) => void
    ): TestFacetBuilder {
      const augBuilder = augmentationBuilder()
      aug(augBuilder)
      taskAugs[taskId] = augBuilder.build()
      return this
    },

    /**
     * Builds the FacetModule instance according to the appended components.
     *
     * @return The constructed FacetModule.
     */
    build(): FacetModule {
      return makeFacetModule({
        id: facetId,
        tasks: moduleTasks(...facetTasks),
        taskAugmentations: taskAugs,
      })
    },
  }
}

/**
 * Builder for creating TaskAugmentations
 */
export const augmentationBuilder = () => {
  let attachments: (string | StepAugmentation)[] = []
  let bindActor: ActorRole | null = null

  return {
    /**
     * Append step augmentations to the generator.
     *
     * Arguments can be either a bare TaskId, which will create a generic
     * task/step augmentation, or StepAugmentation for more granular control.
     *
     * Regardless of type, the final StepAugmentation will be modified to
     * add bindings, parameters and inputs if and actor is bound
     * to augmentation using `bindActor`.
     *
     * @param tasks - The tasks/step augmentations to attach.
     *
     * @return The builder instance.
     */
    attach(...tasks: (TaskId | StepAugmentation)[]) {
      attachments.push(...tasks)
      return this
    },

    /**
     * Bind an actor role to the augmentation.
     *
     * This will result in the final step/TaskAugmentation being
     * decorated with bindings, inputs and parameters for this actor
     * role.
     *
     * @param actorRole - The actor role to bind.
     *
     * @return The builder instance.
     */
    bindActor(actorRole: ActorRole) {
      bindActor = actorRole
      return this
    },

    /**
     * Builds the TaskAugmentation according to the appended components.
     *
     * @return The constructed TaskAugmentation.
     */
    build(): TaskAugmentation {
      return {
        steps: async ({ ctx, step }) => {
          const boundActor = bindActor
            ? resolveStepActorRole(ctx, step, bindActor)
            : undefined
          if (bindActor && !boundActor) {
            return []
          }
          return attachments.map((a) => {
            const stepAug =
              typeof a === 'string'
                ? {
                    type: a,
                  }
                : a

            if (boundActor) {
              Object.assign((stepAug.bind ??= {}), {
                [bindActor]: boundActor.name,
                key: bindActor,
              })
              Object.assign((stepAug.inputs ??= {}), {
                [bindActor]: boundActor,
              })

              Object.assign((stepAug.parameters ??= {}), {
                [bindActor]: {
                  type: 'actor',
                  required: true,
                  defaults: [{ ref: 'target' }],
                },
              })
            }

            return stepAug
          })
        },
      }
    },
  }
}

type AugmentationBuilder = ReturnType<typeof augmentationBuilder>

/**
 * Simple fake project Facet that identifies projects and submodules
 * in a tree structure.
 *
 * For use in tests that require identification of projects and
 * submodules without the need to fulfill the actual requirements
 * of a module/tech stack/package system.
 *
 * Any folder containing a fake-project.json file is considered to
 * be either the root project or a submodule.
 *
 * The root project is identified by the fake-project.json file
 * having the property isRoot=true
 */
export const FakeProjectFacet = makeFacetModule({
  id: 'fake-project',
  detect: async (ctx, dir) => {
    const projFilePath = path.join(dir, 'fake-project.json')
    if (await ctx.disk.exists(projFilePath)) {
      const project = await ctx.disk.readJson(projFilePath)
      const advice = { facets: [] }

      if (project.isRoot) {
        advice.facets.push({
          facet: 'project',
          scope: {
            config: {
              type: 'monorepo',
              subModules: (
                await ctx.disk.scanDir(dir, {
                  filter: (entry) =>
                    entry.name === 'fake-project.json' &&
                    path.dirname(entry.path) !== dir,
                })
              ).map((entry) => ({
                name: path.basename(path.dirname(entry.path)),
                root: path.dirname(entry.path),
                relativeRoot: path.relative(dir, path.dirname(entry.path)),
              })),
            },
          },
        })
      }

      return {
        detected: true,
        advice,
      }
    }

    return {
      detected: false,
    }
  },
})
