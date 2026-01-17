import { FacetId } from './facet'
import { MutationType } from './mutation'

export type VCSMutationType = 'commit' | 'init' | 'de-init'

export interface VCSFileEntry {
  mode: MutationType
  file: string
}

export interface VCSMutation {
  mutationType: 'vcs'
  vcs: string
  repository: string
  type: VCSMutationType
  message?: string
  changeset?: VCSFileEntry[]
}

export interface VCSIgnoreFile {
  pattern: string
  groups: string[]
  source: FacetId
}
