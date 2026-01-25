import { queryArtifacts } from './package-manager.artifacts'
import { queryPackageManager } from './project.package-manager'
import { queryVersionControlIgnoreFiles } from './version-control.ignore-files'

export const queryIndex = {
  'package-manager:artifacts': queryArtifacts,
  'project:package-manager': queryPackageManager,
  'version-control:ignore-files': queryVersionControlIgnoreFiles,
}
