/**
 * Defines the structure of various script nodes used in a scripting language
 * parser.
 */
export interface BaseNode {
  /**
   * The type of the script node.
   */
  type: string
  /**
   * The literal text content of the script node
   */
  literal: string
  /**
   * Optional description decoration
   */
  description?: {
    /**
     * A brief human-readable summary of the node's purpose.
     */
    summary?: string
    /**
     * Detailed and structured information about the node and its semantic
     * intent.
     */
    intent?: any
  }
}

export interface NoOpNode extends BaseNode {
  type: 'no-op'
}

export interface CommandNode extends BaseNode {
  type: 'command'
  command: string
  args: string[]
  env: Record<string, string>
  literal: string
}

export interface LogicalNode extends BaseNode {
  type: 'logical'
  kind: 'and' | 'or'
  operator: string
  left: ScriptNode
  right: ScriptNode
}

export interface ForwardNode extends BaseNode {
  type: 'forward'
  kind: 'pipe'
  operator: string
  left: ScriptNode
  right: ScriptNode
}

export interface PathNode extends BaseNode {
  type: 'path'
  path: string
  literal: string
}

export interface KeywordNode extends BaseNode {
  type: 'keyword'
  keyword: string
  literal: string
}

/**
 * Union type representing all possible script nodes.
 */
export type ScriptNode =
  | CommandNode
  | LogicalNode
  | ForwardNode
  | PathNode
  | KeywordNode
  | NoOpNode
