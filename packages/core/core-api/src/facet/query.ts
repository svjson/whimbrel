import { Actor } from '@src/actor'
import { WhimbrelContext } from '@src/context'
import { FacetId } from './declaration'

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
 */
export interface FacetQuery {
  type: string
  actor?: Actor
  subModules?: boolean
}

/**
 * The result of executing a FacetQuery against a specific facet.
 *
 * Includes the source FacetId that produced the result,
 * and the result data itself.
 */
export interface FacetQueryResult {
  source: FacetId
  result: any
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
 */
export type FacetQueryFunction = (ctx: WhimbrelContext, query: FacetQuery) => Promise<any>

/**
 * Mapping of query types to their corresponding FacetQueryFunction implementations.
 * Used to register and look up query implementations by type.
 */
export type QueryIndex = Record<string, FacetQueryFunction>
