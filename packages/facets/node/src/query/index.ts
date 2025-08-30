import { queryVersionControlIgnoreFiles } from './version-control.ignore-files'
import { queryLicenseContextDefault } from './license.context-default'

export const queryIndex = {
  'version-control:ignore-files': queryVersionControlIgnoreFiles,
  'license:context-default': queryLicenseContextDefault,
}
