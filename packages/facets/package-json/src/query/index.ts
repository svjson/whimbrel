import queryActorCanonicalName from './actor.canonical-name'
import queryProjectLicense from './project.license'
import queryProjectMetadata from './project.metadata'

export const queryIndex = {
  'actor:canonical-name': queryActorCanonicalName,
  'project:license': queryProjectLicense,
  'project:metadata': queryProjectMetadata,
}
