import { queryArtifacts } from './package-manager.artifacts'
import { queryVersionControlIgnoreFiles } from './version-control.ignore-files'

export const queryIndex = {
  'package-manager:artifacts': queryArtifacts,
  'version-control:ignore-files': queryVersionControlIgnoreFiles,
}
