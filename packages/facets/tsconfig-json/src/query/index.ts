import { querySourceFolders } from './project.source-folders'
import { queryVersionControlIgnoreFiles } from './version-control.ignore-files'

export const queryIndex = {
  'project:source-folders': querySourceFolders,
  'version-control:ignore-files': queryVersionControlIgnoreFiles,
}
