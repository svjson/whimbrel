import { MutationType } from './mutation'

export type VCSMutationType = 'commit' | 'init'

export interface VCSFileEntry {
  mode: MutationType
  file: string
}

export interface VCSMutation {
  mutationType: 'vcs'
  repository: string
  type: VCSMutationType
  message: string
  changeset: VCSFileEntry[]
}
