import { queryArtifacts } from './package-manager.artifacts'
import { queryExplainScript } from './package-manager.explain-script'

export const queryIndex = {
  'package-manager:artifacts': queryArtifacts,
  'package-manager:explain-script': queryExplainScript,
}
