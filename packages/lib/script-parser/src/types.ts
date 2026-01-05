interface BaseNode {
  type: string
  literal: string
  description?: {
    summary?: string
    intent: any
  }
}

interface NoOpNode extends BaseNode {
  type: 'no-op'
}

interface CommandNode extends BaseNode {
  type: 'command'
  command: string
  args: string[]
  env: Record<string, string>
  literal: string
}

interface LogicalNode extends BaseNode {
  type: 'logical'
  kind: 'and' | 'or'
  operator: string
  left: ScriptNode
  right: ScriptNode
}

interface ForwardNode extends BaseNode {
  type: 'forward'
  kind: 'pipe'
  operator: string
  left: ScriptNode
  right: ScriptNode
}

type ScriptNode = CommandNode | LogicalNode | ForwardNode | NoOpNode
