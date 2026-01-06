import { ScriptDescription } from '@src/script'

interface ExplainScriptId {
  scriptId: string
}

interface ExplainScriptContent {
  scriptContent: string
}

export type ExplainScriptCriteria = ExplainScriptId | ExplainScriptContent

export interface ScriptExplanation {
  description: ScriptDescription
  script: any
}
