import {
  ExecuteTaskFunction,
  ExecutionStep,
  WhimbrelContext,
  stepResultEqual,
} from '@whimbrel/core-api'
import { rtMemFsContext, testIOContext } from '@whimbrel-test/context-fixtures'
import { StepDefinition, makeConcreteStep } from '@whimbrel-test/step-fixtures'

export type ContainsCtx = { ctx: WhimbrelContext }

export interface StepExecutionTestSpec<
  InitialCtx,
  CtxInitialized,
  GivenParams,
  GivenResult,
  WhenParams,
  WhenResult,
  ThenParams,
> {
  /**
   * Test name/description.
   */
  test: string

  /**
   * Optional setup-function to run before both flavours of the test,
   * for creating tmp folders and pre-conditions
   */
  before?: () => Promise<InitialCtx> | InitialCtx

  /**
   * Define the ExecutionStep to execute
   */
  defineStep: (initial: InitialCtx) => ExecutionStep | StepDefinition

  /**
   * Optional test life-cycle functions for the dry run execution.
   */
  dryRun?: {
    makeCtx: (params: InitialCtx) => Promise<CtxInitialized>
    given?: (params: GivenParams) => Promise<GivenResult>
    when?: (params: WhenParams) => Promise<WhenResult>
    then?: (params: ThenParams) => Promise<void> | void
  }

  /**
   * Optional test life-cycle functions for the live run execution.
   */
  liveRun?: {
    makeCtx: (params: InitialCtx) => Promise<CtxInitialized>
    given?: (params: GivenParams) => Promise<GivenResult>
    when?: (params: WhenParams) => Promise<WhenResult>
    then?: (params: ThenParams) => Promise<void> | void
  }

  /**
   *
   */
  prepareContext?: (params: CtxInitialized) => void

  given?: (params: GivenParams) => Promise<GivenResult>
  when?: (params: WhenParams) => Promise<WhenResult>
  then?: (params: ThenParams) => Promise<void> | void
}

interface DeferredPromise {
  promise: Promise<any>
  resolve: Function
  reject: Function
}

const deferred = (): DeferredPromise => {
  let resolve: Function, reject: Function

  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  }).catch((e) => {
    console.error(e)
    throw e
  })

  return { promise, resolve, reject }
}

const runTypes = [
  {
    key: 'dryRun',
    initFactory: 'dryRun',
    name: 'Dry Run',
    execFunction: 'dryExecute',
  },
  {
    key: 'liveRun',
    initFactory: 'liveRun',
    name: 'Live Run',
    execFunction: 'execute',
  },
]

export const stepExecutionFixture = ({ describe, expect, test }) => {
  return {
    stepExecutionTest: <
      InitialCtx,
      GivenResult,
      GivenParams,
      WhenResult,
      CtxInitialized extends ContainsCtx = InitialCtx & ContainsCtx,
      PostGivenCtx extends ContainsCtx = GivenParams & CtxInitialized,
      WhenParams extends {
        ctx: WhimbrelContext
        executeTask: ExecuteTaskFunction
      } = CtxInitialized & PostGivenCtx & { executeTask: ExecuteTaskFunction },
      ThenParams = InitialCtx & CtxInitialized & PostGivenCtx & WhenResult,
    >(
      spec: StepExecutionTestSpec<
        InitialCtx,
        CtxInitialized,
        GivenParams,
        GivenResult,
        WhenParams,
        WhenResult,
        ThenParams
      >
    ) => {
      /**
       * Convenience function for throwing configuration errors.
       */
      const configError = (msg: string) => {
        throw new Error(`stepExecutionTest setup: ${spec.test} - ${msg}`)
      }

      if (!spec.dryRun) {
        spec.dryRun = {
          makeCtx: async ({}): Promise<CtxInitialized> => {
            return { ctx: await rtMemFsContext() } as CtxInitialized
          },
        }
      }

      if (!spec.liveRun) {
        spec.liveRun = {
          makeCtx: async ({}): Promise<CtxInitialized> => {
            return { ctx: await testIOContext() } as CtxInitialized
          },
        }
      }

      /**
       * Create promises to be resolved when dry and live runs are completed
       */
      const promises = {
        dryRun: deferred(),
        liveRun: deferred(),
      }

      describe(spec.test, () => {
        runTypes.forEach((runType) => {
          const runTypeSpec = spec[runType.key]

          /**
           * If a before-function is present, it must be executed once as
           * but run types require the same output from it. This is where
           * temporary directories may be created.
           */
          const before =
            typeof spec.before === 'function'
              ? spec.before()
              : Promise.resolve({} as InitialCtx)

          const makeCtx = runTypeSpec.makeCtx
          const given =
            runTypeSpec.given ??
            spec.given ??
            (async (_: GivenParams) => {
              return {}
            })
          const when =
            runTypeSpec.when ??
            spec.when ??
            (async ({ executeTask, ctx }: WhenParams) => {
              await executeTask(ctx)
              return {}
            })
          const then = spec[runType.key].then ?? spec.then

          /**
           * Verify that all required clauses are present.
           */
          if (!then) configError(`No valid 'then' clause for ${runType.name}.`)

          /**
           * Declare actual test case using `test` from vitest.
           *
           * A test case is executed by first resolving initial variables
           * and optionally creating and configuring the context before
           * executing the given-when-then steps:
           *
           * - Declare variables (result of `before` or empty object)
           * - (Optional) Call `makeCtx`
           * - (Optional) Call `prepareCtx`
           * - Resolve the step execution function (execute or dryExecute)
           * - Call `given`
           * - Call `when`
           * - Call `then`
           * - Resolve promise for runtime (to enable step comparison test).
           */
          test(runType.name, async () => {
            try {
              /**
               * Apply before function results
               */
              const initialCtx: InitialCtx = await before

              const stepDefinition = spec.defineStep(initialCtx)
              const step = makeConcreteStep(stepDefinition)
              /**
               * Create the WhimbrelContext for the current runtype
               */
              const ctxInitializedCtx: InitialCtx & CtxInitialized = Object.assign(
                initialCtx,
                (await makeCtx(initialCtx)) ?? {}
              )

              if (spec.prepareContext) {
                spec.prepareContext(ctxInitializedCtx)
              }

              /**
               * Extract and validate the presence of the expected execution function
               * in the step declaration. (execute or dryExecute)
               */
              const executeTask: ExecuteTaskFunction = step.task[runType.execFunction]
              if (!executeTask) {
                configError(`No execute function - ${runType.execFunction}`)
              }

              /**
               * Execute the `given` phase of the test
               */
              const postGivenCtx: PostGivenCtx = Object.assign(
                ctxInitializedCtx,
                (await given(ctxInitializedCtx)) ?? {}
              )

              /**
               * Validate that a ctx is present in the test variables.
               *
               * It should typically be present before, but the execution of
               * `given` is the last opportunity for it to be created.
               */
              if (!(postGivenCtx as any).ctx) {
                configError(
                  'No ctx present after makeCtx, prepareCtx and given execution'
                )
              }

              postGivenCtx.ctx.step = step

              /**
               * Execute the `when` phase - the phase where step is executed.
               */
              const postWhenCtx = Object.assign(
                postGivenCtx,
                (await when({ ...postGivenCtx, executeTask })) ?? {}
              )

              /**
               * Execute the `then` phase.
               */
              await then({ ...postWhenCtx })

              /**
               * Signal test completion by resolving the promise for the
               * execution type.
               */
              promises[runType.key].resolve(postWhenCtx.ctx)
            } catch (e) {
              promises[runType.key].reject(`${runType.name} test failed`)
              throw e
            }
          })
        })

        test('Compare results', async () => {
          const [dryRunCtx, liveRunCtx] = await Promise.all([
            promises.dryRun.promise,
            promises.liveRun.promise,
          ]).catch((e) => {
            console.error(e)
            throw e
          })

          expect(
            stepResultEqual(dryRunCtx, liveRunCtx.stepResult, dryRunCtx.stepResult)
          ).toBe(true)
        })
      })
    },
  }
}
