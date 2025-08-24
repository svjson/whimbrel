import { juxt } from '@whimbrel/array'
import {
  JournalEntry,
  StepExecutionResult,
  VCSMutation,
  WhimbrelContext,
} from '@whimbrel/core-api'
import equal from 'fast-deep-equal'

export const fmt = (val: any) => {
  // if (val instanceof JSONFile) {
  //   return `JSON file:${val.path}`
  // }

  // if (typeof val === 'object') {
  //   return JSON.stringify(cleanValue(val))
  // }
  return val
}

const safeJournalEntry = (e: JournalEntry): JournalEntry => {
  if (e.origin === 'flow' && e.type === 'let') {
    return {
      ...e,
      payload: {
        ...e.payload,
        value: fmt(e.payload.value),
      },
    }
  }

  return e
}

export const vcEntryEqual = (
  _ctx: WhimbrelContext,
  a: VCSMutation,
  b: VCSMutation
): boolean => {
  if (!a || !b) return false
  if (a.vcs !== b.vcs) return false

  // const { journalEntryEqual } = ctx.collaborators[a.vcs].impl.vcEntryEqual
  // if (typeof journalEntryEqual === 'function') {
  //   return journalEntryEqual(a, b)
  // }

  return equal(a, b)
}

export const journalEntryEqual = (a: JournalEntry, b: JournalEntry) => {
  const [ca, cb] = [a, b].map(safeJournalEntry)
  return equal(ca, cb)
}

const both = (fn: (v: any) => boolean, a: any, b: any) => {
  return fn(a) && fn(b)
}

const eq = (fn: (a: any) => any, a: any, b: any) => {
  return fn(a) === fn(b)
}

const isSameType = (a: any, b: any) => {
  return eq((sr: any) => typeof sr, a, b)
}

const isBothUndefined = (a: any, b: any) => {
  return both((sr: any) => typeof sr === 'undefined', a, b)
}

export const stepResultEqual = (
  ctx: WhimbrelContext,
  a: StepExecutionResult,
  b: StepExecutionResult
) => {
  if (!isSameType(a, b)) return false
  if (isBothUndefined(a, b)) return true

  if (!both(Array.isArray, a.journal, b.journal)) return false
  if (!eq((m: any) => typeof m, a.mutations, b.mutations)) return false

  if (a.journal.length !== b.journal.length) return false

  if (
    !juxt(a.journal, b.journal).reduce((result: boolean, [va, vb]) => {
      return result && journalEntryEqual(va, vb)
    }, true)
  ) {
    return false
  }

  if (both((m: any) => typeof m === 'object', a.mutations, b.mutations)) {
    const am = a.mutations
    const bm = b.mutations

    if (!eq(Array.isArray, am.fs, bm.fs)) return false
    if (!eq(Array.isArray, am.vcs, bm.vcs)) return false

    if (both(Array.isArray, am.vcs, bm.vcs)) {
      if (!eq((l: []) => l.length, am.vcs, bm.vcs)) {
        juxt(am.vcs, bm.vcs).reduce(
          (result, [ea, eb]) => result && vcEntryEqual(ctx, ea, eb),
          true
        )
      }
    } else {
      return equal(a.mutations, b.mutations)
    }
  }

  return true
}
