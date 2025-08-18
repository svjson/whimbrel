import { Actor } from './actor'
import { WhimbrelEvent } from './event'
import { ExecutionStep, StepExecutionResult } from './execution'
import { FacetRegistry } from './facet'
import { FileSystem } from './fs'
import { ApplicationLog, Formatter } from './log'
import { Mutation } from './mutation'

type Class<T> = new (...args: any[]) => T

/**
 * Options used to construct/configure WhimbrelContext instances.
 *
 * Deals with the main composition of the context.
 *
 * @interface WhimbrelContextOptions
 * @property {FacetRegistry} [facets] - The registry of facets available in the context.
 * @property {FileSystem} [disk] - The file system abstraction used for operations.
 * @property {Class<Formatter>} [formatter] - The formatter used for output.
 * @property {string} [cwd] - The current working directory.
 * @property {string} [dir] - The directory to operate in, defaults to `cwd`.
 * @property {ApplicationLog} [log] - The application log for logging messages.
 * @property {boolean} [memCacheOnly] - If true, the context will only use in-memory cache and not persist to disk.
 */
export interface WhimbrelContextOptions {
  facets?: FacetRegistry
  disk?: FileSystem
  formatter?: Class<Formatter>
  cwd?: string
  dir?: string
  log?: ApplicationLog
  memCacheOnly?: boolean
}

/**
 * Options used to inform the behavior of various components of the
 * WhimbrelContext during run-time.
 *
 * Maps 1-1 to the command-line flags allowed by the Whimbrel CLI.
 *
 * @interface WhimbrelCommandOptions
 * @property {boolean} [silent] - If true, suppresses all output except errors.
 * @property {boolean} [verbose] - If true, enables verbose output.
 * @property {string} [haltAt] - If set, halts execution at the specified step ID.
 * @property {boolean} [showStepIds] - If true, shows step IDs in output.
 * @property {Record<string, string>} [prop] - Additional properties to pass to the command.
 */
export interface WhimbrelCommandOptions {
  silent?: boolean
  verbose?: boolean
  haltAt?: string
  showStepIds?: boolean
  prop: Record<string, string>
}

/**
 * WhimbrelContext - the main owner of state during Whimbrel operations.
 *
 * It contains the current working directory, file system, dry-run mode,
 * facets, formatter, log, sources, targets, and the current step being executed.
 * It also provides methods to emit events and accept mutations.
 *
 * @interface WhimbrelContext
 * @property {string} cwd - The current working directory.
 * @property {FileSystem} disk - The file system abstraction used for operations.
 * @property {boolean} dryRun - Indicates if the context is in dry-run mode.
 * @property {FacetRegistry} facets - The registry of facets available in the context.
 * @property {Formatter} formatter - The formatter used for output.
 * @property {ApplicationLog} log - The application log for logging messages.
 * @property {Record<string, Actor>} sources - The source Actors available in the context.
 * @property {Record<string, Actor>} targets - The target Actors available in the context.
 * @property {Actor} [rootTarget] - The root target actor, if any.
 * @property {Actor} [target] - The current target actor being processed.
 * @property {Actor} [source] - The current source actor being processed.
 * @property {ExecutionStep} step - The current execution step being processed.
 * @property {StepExecutionResult} [stepResult] - The result of the last executed step, if any.
 * @property {WhimbrelCommandOptions} options - The command options for the Whimbrel operation.
 * @method emitEvent - Emits an event to the context's event bus.
 * @method acceptMutation - Accepts a mutation to be applied to the context's state.
 */
export interface WhimbrelContext {
  cwd: string
  disk: FileSystem
  dryRun: boolean
  facets: FacetRegistry
  formatter: Formatter
  log: ApplicationLog
  sources: Record<string, Actor>
  targets: Record<string, Actor>
  rootTarget?: Actor
  target?: Actor
  source?: Actor
  step: ExecutionStep
  stepResult?: StepExecutionResult
  options: WhimbrelCommandOptions
  emitEvent(event: WhimbrelEvent): void
  acceptMutation(mutation: Mutation): void
}
