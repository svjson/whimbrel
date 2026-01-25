export interface ProjectMetaData {
  name: string
  version: string
  license: string
  author: string
}

export interface PackageManager {
  name: string
  version: string
}

export interface LicenseIdentifier {
  spdx: string
}
