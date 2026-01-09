/**
 * Recognized roles of facet artifacts
 */
export type ArtifactRole =
  | 'dependency-lock'
  | 'dependency-store'
  | 'workspace'
  | 'submodule-definition'
  | 'package-manager-config'

/**
 * The origin of a facet artifact.
 *
 * - `authored`: Manually created and maintained.
 * - `generated`: Created and maintained by tools.
 */
export type ArtifactOrigin = 'authored' | 'generated'

/**
 * Definition of a conceptual Facet artifact
 */
export interface Artifact {
  /**
   * The type of filesystem object.
   */
  type: 'file' | 'dir' | 'glob'

  /**
   * The file or directory name, or glob pattern.
   */
  name: string

  /**
   * The roles of the artifact, from the perspective of a
   * Facet Role.
   */
  roles: ArtifactRole[]

  /**
   * The origin of the artifact content.
   */
  origin: 'authored' | 'generated'

  /**
   * The regenerability of the artifact.
   *
   * - `always`: Can be automatically fully regenerated at any time.
   * - `lossy`: Can be regenerated, but may lose some information.
   * - `never`: Cannot be regenerated without manual input.
   */
  regenerable: 'always' | 'lossy' | 'never'

  /**
   * Version control system (VCS) handling recommendation for the artifact.
   *
   * - `required`: Must be tracked by VCS for the Facet to function properly.
   * - `recommended`: Should be, and is expected, to be tracked by VCS.
   * - `optional`: May be tracked by VCS, may not be.
   * - `never`: Must not/should not be tracked by VCS.
   */
  vcs: 'required' | 'recommended' | 'optional' | 'never'
}
