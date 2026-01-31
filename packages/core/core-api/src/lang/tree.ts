export interface SourceFolder {
  type: string
  name: string
  relative: string
  absolute: string
}

interface SourceRefBase {
  root: string
}

export interface ProjectSourceFolders extends SourceRefBase {
  type: 'project-source-folders'
}

export interface SourcePathsReference extends SourceRefBase {
  type: 'paths'
  paths: string[]
}

export interface SourceFileReference extends SourceRefBase {
  type: 'source-file'
  path: string
}

export type SourceTreeReference =
  | ProjectSourceFolders
  | SourcePathsReference
  | SourceFileReference
