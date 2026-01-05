interface ExplainScriptId {
  scriptId: string
}

interface ExplainScriptContent {
  scriptContent: string
}

export type ExplainScriptCriteria = ExplainScriptId | ExplainScriptContent

export interface ScriptDescription {}
