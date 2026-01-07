import { Actor, ActorFilter, ActorId, ActorType, GetActorFunction } from './actor'
import { CtxCommandRunner } from './command'
import { WhimbrelEvent } from './event'
import {
  AcceptJournalEntryHandler,
  ExecutionStep,
  StepExecutionResult,
} from './execution'
import { FacetRegistry } from './facet'
import { FileSystem } from './fs'
import { ApplicationLog, Formatter } from './log'
import { AcceptMutationHandler } from './mutation'

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
  sources?: Record<ActorId, Actor>
  targets?: Record<ActorId, Actor>
  maxMaterializationIterations?: number
  memCacheOnly?: boolean
  acceptJournalEntry?: AcceptJournalEntryHandler
  acceptMutation?: AcceptMutationHandler
}

/**
 * Options used to inform the behavior of various components of the
 * WhimbrelContext during run-time.
 *
 * Maps 1-1 to the command-line flags allowed by the Whimbrel CLI.
 *
 * @interface WhimbrelCommandOptions
 */
export interface WhimbrelCommandOptions {
  /**
   * If true, perform only a dry run of the execution
   */
  dryRun?: boolean
  /**
   * If true, suppresses all ansi codes and non-appending
   * output.
   */
  plain?: boolean
  /**
   * If true, suppresses all output except errors.
   */
  silent?: boolean
  /**
   * If true, enables verbose output.
   */
  verbose?: boolean
  /**
   * If set, halts execution at the specified step ID.
   */
  haltAt?: string
  /**
   * Outputs the contents of a file post execution
   */
  cat?: string
  /**
   * If true, shows step IDs in output.
   */
  showStepIds?: boolean
  /**
   * If set, outputs more verbose facet details for one or more actors
   */
  showFacetDetails?: string
  /**
   * If set, overrides that max number of iterations of the materialization
   * phase that are allowed.
   */
  maxMaterializationIterations?: number
  /**
   * Additional, non-standard, properties to pass to the command.
   */
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
 */
export interface WhimbrelContext {
  /**
   * The current working directory.
   */
  cwd: string

  /**
   * The file system abstraction used for disk access.
   *
   * All disk operations during Whimbrel execution are performed through
   * this instance, allowing Whimbrel to operate normally regardless of
   * the underlying file system implementation.
   *
   * This allows for seemless "dry run" operations in all aspects of
   * Whimbrel.
   */
  disk: FileSystem

  /**
   * Registry containing all facet modules known to Whimbrel.
   */
  facets: FacetRegistry

  /**
   * Source Actors known to this WhimbrelContext, discovered during
   * the materialization phase, or provided during construction.
   */
  sources: Record<ActorId, Actor>

  /**
   * Target Actors known to this WhimbrelContext, discovered during
   * the materialization phase, or provided during construction.
   */
  targets: Record<ActorId, Actor>

  /**
   * The Root Target Actor, if any.
   */
  rootTarget?: Actor

  /**
   * The currently selected Source Actor, if any.
   */
  source?: Actor

  /**
   * The currently selected Target Actor, if any.
   */
  target?: Actor

  /**
   * Whimbrel application log.
   */
  log: ApplicationLog

  /**
   * Formatter-instance used for formatting Whimbrel output.
   */
  formatter: Formatter

  /**
   * The current execution step being processed.
   */
  step: ExecutionStep

  /**
   * Options affecting the materialization phase.
   */
  materializationOptions: {
    maxIterations: number
  }

  /**
   * True while the materialization phase is ongoing.
   */
  materializationRun: boolean

  /**
   * Signals if Whimbrel is currently performing a dry run.
   */
  dryRun: boolean

  /**
   * The result of the last executed or currently executing step, if any.
   */
  stepResult?: StepExecutionResult

  /**
   * The initialization options of this WhimbrelContext
   */
  options: WhimbrelCommandOptions

  /**
   * Retrieves a single actor based on ActorId or filter criteria.
   *
   * @param identifier - ActorId or ActorFilter used to identify the Actor
   * @param type - Optional ActorType to further narrow the search
   *
   * @return The located Actor, or undefined if not found
   */
  getActor: GetActorFunction

  /**
   * Emits a WhimbrelEvent
   *
   * @param event - The WhimbrelEvent to emit.
   */
  emitEvent(event: WhimbrelEvent): void

  /**
   * Executes a command on the host system.
   *
   * @param cwd - The current working directory to execute the command in.
   * @param command - The command to execute, either as a string or an array
   *
   * @return A promise that resolves to a tuple containing the command's
   */
  runCommand: CtxCommandRunner

  /**
   * Records a state mutation.
   *
   * @param mutation - The mutation to record
   */
  acceptMutation: AcceptMutationHandler

  /**
   * Records a journal entry.
   *
   * @param entry - The journal entry to record
   */
  acceptJournalEntry: AcceptJournalEntryHandler

  /**
   * Resets all actors in the context.
   */
  resetActors(): void
}
