import { ScriptNode } from '@whimbrel/script-parser'
import { makeNpmCommandParser, makeNpxCommandParser } from './parser'
import { ScriptIntent } from '@whimbrel/core-api'

const parsers = {
  npm: makeNpmCommandParser,
  npx: makeNpxCommandParser,
}

const lowerLeading = (s: string) => {
  return s ? s[0].toLowerCase() + s.slice(1) : s
}

export const decorateScriptNode = async (node: ScriptNode) => {
  if (node.type === 'command') {
    const parser = parsers[node.command]?.()
    if (parser) {
      const [cmd] = parser.parse(node)
      if (cmd) {
        node.description = cmd.description
      }
    }
  } else if (node.type === 'logical') {
    const { left, right } = node
    const nodes = [left, right]
    await Promise.all(nodes.map(decorateScriptNode))

    const summaries: string[] = nodes
      .flatMap((n) => n.description?.summary)
      .map((s, i) => (i === 0 ? s : lowerLeading(s)))
    const intents: ScriptIntent[] = nodes.flatMap((n) => n.description?.intent)

    node.description = {
      summary: summaries.join(` ${node.kind} `),
      intent: {
        op: 'composite',
        kind: node.kind,
        intents,
        target: undefined,
      },
    }
  }
}

export const decorateScript = async (script: ScriptNode[]) => {
  for (const node of script) {
    await decorateScriptNode(node)
  }
}

export const summarizeScript = (script: ScriptNode[]) => {
  return script[0].description?.summary
}

export const collectIntent = (script: ScriptNode[]) => {
  return script[0].description?.intent
}
