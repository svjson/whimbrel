import { WhimbrelError } from '@src/core'
import { FacetId } from './declaration'

/**
 * Error class representing an implementation error within a facet.
 * Includes the facet ID and additional details about the error.
 */
export class FacetImplementationError extends WhimbrelError {
  /**
   * Creates a new FacetImplementationError instance.
   *
   * @param message - The error message
   * @param facetId - The ID of the facet where the error occurred
   * @param details - Additional details about the error
   */
  constructor(
    message: string,
    public facetId: FacetId,
    public details: any
  ) {
    super(message)
  }
}
