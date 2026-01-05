/**
 * Defines the structure of various script nodes used in a scripting language
 * parser.
 */
interface BaseNode {
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

interface PathNode extends BaseNode {
  type: 'path'
  path: string
  literal: string
}

interface KeywordNode extends BaseNode {
  type: 'keyword'
  keyword: string
  literal: string
}

/**
 * Union type representing all possible script nodes.
 */
type ScriptNode =
  | CommandNode
  | LogicalNode
  | ForwardNode
  | PathNode
  | KeywordNode
  | NoOpNode
