import { ScriptNode } from '@whimbrel/script-parser'
import { makeNpmCommandParser, makeNpxCommandParser } from './parser'

const parsers = {
  npm: makeNpmCommandParser,
  npx: makeNpxCommandParser,
}

export const decorateScript = async (script: ScriptNode[]) => {
  for (const node of script) {
    if (node.type === 'command') {
      const parser = parsers[node.command]?.()
      if (parser) {
        const [cmd] = parser.parse(node)
        if (cmd) {
          node.description = cmd.description
        }
      }
    }
  }
}

export const summarizeScript = (script: ScriptNode[]) => {
  return script[0].description?.summary
}

export const collectIntent = (script: ScriptNode[]) => {
  return script[0].description?.intent
}
