export interface ConcreteValueResolution {
  type: 'concrete'
  value: any
}

export interface EnvValueResolution {
  type: 'env'
  name: string
}

export interface ProcessArgValueResolution {
  type: 'process-arg'
  index: number
}

export interface BuiltInFunCallResolution {
  type: 'builtin-funcall'
  name: string
  arguments: ValueResolution
}

export interface UnresolvedSymbol {
  type: 'symbol'
  name: string
}

export type ValueResolution =
  | ConcreteValueResolution
  | EnvValueResolution
  | ProcessArgValueResolution
  | BuiltInFunCallResolution
  | UnresolvedSymbol

export interface HttpPortResolution {
  primary: ValueResolution
  fallbacks: ValueResolution[]
}
