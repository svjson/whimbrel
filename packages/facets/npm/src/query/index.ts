import { queryArtifacts } from './package-manager.artifacts'
import { queryExplainScript } from './package-manager.explain-script'
import { queryPackageManager } from './project.package-manager'

export const queryIndex = {
  'package-manager:artifacts': queryArtifacts,
  'package-manager:explain-script': queryExplainScript,
  'project:package-manager': queryPackageManager,
}
