import { FunctionInvocationDescription } from './description'

export interface InvocationArgumentResolution {
  type: string
  literal: string
  name?: string
  value?: any
}

export interface InvocationExpression {
  language: string
  description: FunctionInvocationDescription
  arguments: InvocationArgumentResolution[]
}
