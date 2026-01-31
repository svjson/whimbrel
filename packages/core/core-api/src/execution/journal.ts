import { WhimbrelContext } from '@src/context'

export type JournalEntryType = string

export type AcceptJournalEntryHandler = (entry: JournalEntry) => void

export const defaultJournalEntryHandler = (ctx: WhimbrelContext) => {
  return (entry: JournalEntry) => {
    if (ctx.stepResult) {
      ctx.stepResult.journal.push(entry)
    }
  }
}

export type JournalEntryOrigin = 'flow'

export interface JournalEntry {
  origin: JournalEntryOrigin
  type: JournalEntryType
  payload: any
  private?: boolean
}
