import { WhimbrelContext } from '@src/context'
import { FacetDeclaration } from './declaration'
import { FacetScopePrototype } from './scope'

/**
 * Structure used by facet implementations to communicate a positive
 * detection result.
 *
 * A positive detection result may provide details about the detected
 * facet, that are intrinsic to each facet type.
 *
 * It may also provide advice for other facets. Ie, a detected
 * http-adapter facet may advise that a `project` is of the `http-service`
 * type.
 *
 * This is the return type of `DetectFunction`.
 */
export type DetectedFacet = {
  /**
   * Always `true` for a DetectedFacet.
   *
   * This is the discriminator between DetectedFacet and NoFacetDetected.
   */
  detected: true
  /**
   * Details about the detected facet.
   */
  facet?: {
    /**
     * Scope details about the detected facet.
     */
    scope: FacetScopePrototype
  }
  /**
   * Advice about other facets that may be relevant given this detection.
   *
   * For example, detecting an `http-adapter` facet may lead to
   * advising that a `project` facet of type `http-service` be included.
   */
  advice?: {
    /**
     * Facet declarations to consider including alongside this detected facet.
     */
    facets?: FacetDeclaration[]
  }
}

/**
 * Structure used by facet implementations to communicate a negative
 * detection result.
 */
export type NoFacetDetected = {
  /**
   * Always `false` for a NoFacetDetected.
   *
   * This is the discriminator between DetectedFacet and NoFacetDetected.
   */
  detected: false
}

/**
 * The result of a facet detection attempt.
 *
 * Either a DetectedFacet or NoFacetDetected.
 */
export type FacetDetectionResult = DetectedFacet | NoFacetDetected

/**
 * Function type for facet detection functions.
 *
 * Facet implementations may provide a detection function that
 * scans a directory to determine if the facet is present.
 *
 * If so, it returns a DetectedFacet structure with details about
 * the detected facet.
 *
 * If not, it returns a NoFacetDetected structure.
 *
 * @param ctx The Whimbrel context
 * @param dir The directory to scan
 */
export type DetectFunction = (
  /**
   * The Whimbrel context
   */
  ctx: WhimbrelContext,
  /**
   * The directory to scan
   */
  dir: string
) => Promise<FacetDetectionResult>

/**
 * Stock null-implementation of DetectFunction that always returns
 * NoFacetDetected.
 */
export const NoDetectFunction = async (_ctx: WhimbrelContext, _dir: string) => ({
  detected: false,
})
