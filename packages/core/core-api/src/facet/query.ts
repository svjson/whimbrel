import { Actor } from '@src/actor'
import { WhimbrelContext } from '@src/context'
import { FacetId } from './declaration'
import { FunctionInvocationDescription, SourceFolder } from '@src/lang'

/**
 * Describes a query to be performed against the facets of an Actor.
 *
 * Used to request specific information or data from facets
 * within the context of an Actor, without concrete knowledge of
 * present facets.
 *
 * The 'type' property specifies the type of query to be performed.
 * The optional 'actor' property allows scoping the query to a
 * specific Actor. If omitted, the query may be performed
 * across all relevant Actors.
 *
 * The optional 'criteria' property allows for additional
 * parameters or filters to refine the query.
 *
 * The optional 'subModules' property indicates whether
 * the query should include sub-modules of the Actor.
 *
 * @template QRS - The type of the query result
 * @template QCR - The type of the criteria object
 */
export interface FacetQuery<
  QT extends string,
  QRS = InferQueryResultType<QT>,
  QCR = InferQueryCriteriaType<QT>,
> {
  /**
   * The type of query to be performed.
   */
  type: QT
  /**
   * The Actor context for the query.
   */
  actor?: Actor
  /**
   * Optional criteria to refine or filter the query.
   */
  criteria?: QCR
  /**
   * Whether to include sub-modules in the query.
   */
  subModules?: boolean
}

/**
 * The result of executing a FacetQuery against a specific facet.
 *
 * Includes the source FacetId that produced the result,
 * and the result data itself.
 *
 * @template QRS - The type of the result data
 */
export interface FacetQueryResult<QRS = any> {
  source: FacetId
  result: QRS
}

/**
 * Function type for functions implementing facet queries.
 *
 * Used by facets to provide implementations for specific
 * query types.
 *
 * These functions take a WhimbrelContext and a FacetQuery
 * as parameters, and return a Promise that resolves
 * to any type, representing the result of the query.
 *
 * @param ctx The Whimbrel context
 * @param query The FacetQuery to be executed
 *
 * @template QRS - The type of the query result
 * @template QCR - The type of the criteria object
 */
export type FacetQueryFunction<
  QT extends string,
  QRS = InferQueryResultType<QT>,
  QCR = InferQueryCriteriaType<QT>,
> = (ctx: WhimbrelContext, query: FacetQuery<QT, QRS, QCR>) => Promise<QRS | undefined>

/**
 * Mapping of query types to their corresponding FacetQueryFunction implementations.
 * Used to register and look up query implementations by type.
 */
export type QueryIndex = Record<string, FacetQueryFunction<string>>

/**
 * Type utility to infer the result type of a query based on its type string.
 *
 * If the type string matches a key in FacetQueryTypes, it returns
 * the corresponding QueryResultType; otherwise, it returns unknown.
 *
 * @template T - The query type string
 */
export type InferQueryResultType<T extends string> = T extends keyof FacetQueryTypes
  ? FacetQueryTypes[T]['QueryResultType']
  : unknown

/**
 * Type utility to infer the criteria type of a query based on its type string.
 *
 * If the type string matches a key in FacetQueryTypes, it returns
 * the corresponding CriteriaType; otherwise, it returns unknown.
 *
 * @template T - The query type string
 */
export type InferQueryCriteriaType<T extends string> = T extends keyof FacetQueryTypes
  ? FacetQueryTypes[T]['CriteriaType']
  : unknown

/**
 * Query result and criteria types for stock query types
 */
export type FacetQueryTypes = {
  'actor:canonical-name': {
    QueryResultType: string
    CriteriaType: never
  }
  'language:invocation': {
    QueryResultType: any
    CriteriaType: {
      functionInvocation: FunctionInvocationDescription
      sourceFolders: string[]
    }
  }
  'license:context-default': {
    QueryResultType: string
    CriteriaType: never
  }
  'project:license': {
    QueryResultType: { spdx: string }
    CriteriaType: never
  }
  'project:metadata': {
    QueryResultType: {
      name: string
      version: string
      license: string
      author: string
    }
    CriteriaType: never
  }
  'project:source-folders': {
    QueryResultType: SourceFolder[]
    CriteriaType: never
  }
  'version-control:ignore-files': {
    QueryResultType: {
      pattern: string
      groups: string[]
      source: FacetId
    }[]
    CriteriaType: never
  }
}
