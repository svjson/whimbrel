export interface ProjectConfig {
  type?: 'default' | 'root' | 'monorepo'
  subModules?: {
    actorId?: string
    name: string
    root: string
    relativeRoot: string
  }[]
}
