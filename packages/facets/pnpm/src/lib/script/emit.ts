import { ScriptExplanation } from '@whimbrel/core-api'
import { CommandNode, ScriptNode } from '@whimbrel/script-parser'

const rewritePkgManagerNode = (node: CommandNode) => {
  const parts = ['pnpm']
  if (!node.description) {
    return node.literal
  }
  const { intent } = node.description
  if (intent.op === 'execute') {
    if (intent.kind === 'package.json-script') {
      const command = intent.id

      if (intent.target.type === 'workspace') {
        parts.push('-r')
      }

      if (intent.target.type === 'module' && intent.target.module !== 'self') {
        parts.push('--filter', intent.target.module)
      }

      parts.push(command)
    }
  } else if (intent.op === 'publish') {
    const { target } = intent

    parts.push('publish')
    if (target?.flags?.accessType) {
      parts.push('--access')
      parts.push(target.flags.accessType)
    }
  }

  return parts.join(' ')
}

const rewriteNode = (node: ScriptNode) => {
  if (node.type === 'command') {
    if (node.command === 'npm') {
      return rewritePkgManagerNode(node)
    } else {
      return node.literal
    }
  } else if (node.type === 'logical' || node.type === 'forward') {
    return [rewriteNode(node.left), node.operator, rewriteNode(node.right)].join(' ')
  } else {
    return node.literal
  }
}

export const rewriteScript = (script: ScriptExplanation) => {
  let parts = []

  for (const node of script.script) {
    parts.push(rewriteNode(node))
  }

  return parts.join(' ')
}
