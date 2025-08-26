import {
  ContextMutation,
  ExecutionStep,
  FileListOptions,
  FileSystemMutation,
  Formatter,
  JournalEntry,
  StepExecutionResult,
  VCSMutation,
  WhimbrelContext,
} from '@whimbrel/core-api'
import { mergeLeft } from '@whimbrel/walk'

export interface DefaultFormatterConfiguration {
  journal?: {
    bullet?: (entry: JournalEntry) => string
    letEntry?: (entry: JournalEntry) => string
  }
  mutations?: {
    ctx?: {
      add?: string
      set?: string
      mutation?: (bullet: string, type: string, subject: string) => string
    }
    fs?: {
      create?: string
      modify?: string
      delete?: string
    }
    vcs?: {
      create?: string
      modify?: string
      delete?: string
      title: (mutation: VCSMutation) => string
    }
  }
}

/**
 * Default formatter for headless runs.
 *
 * Produces plain text output without ANSI codes.
 */
export class DefaultFormatter implements Formatter {
  contextSymbols = {
    add: '⊕',
    set: '⇒',
    mutation: (bullet: string, type: string, subject: string) =>
      `${bullet} ${type}: ${subject}`,
  }
  fileSystemSymbols = {
    create: 'A',
    modify: 'M',
    delete: 'R',
  }
  vcsSymbols = {
    create: 'A',
    modify: 'M',
    delete: 'R',
    title: (mutation: VCSMutation) => {
      switch (mutation.type) {
        case 'init':
          return `${mutation.type}: ${mutation.repository}`
        case 'commit':
          return `${mutation.type}: ${mutation.message?.trim()}`
      }
    },
  }
  journalFormatters = {
    bullet: (_entry: JournalEntry) => '⇒',
    letEntry: (entry: JournalEntry) => `${entry.payload.name}: ${entry.payload.value}`,
  }

  constructor(
    protected ctx: WhimbrelContext,
    config: DefaultFormatterConfiguration = {}
  ) {
    mergeLeft(this.contextSymbols, config.mutations?.ctx)
    mergeLeft(this.fileSystemSymbols, config.mutations?.fs)
    mergeLeft(this.journalFormatters, config.journal)
  }

  formatStepTitle(step: ExecutionStep): string {
    const stepType = this.ctx.options.showStepIds ? ` (${step.id})` : ''

    let title = step.name
    let reason = ''

    if (step.treeState?.state === 'satisfied') {
      title = title
      reason = [' (', step.treeState.reason ?? step.treeState.state, ')'].join('')
    }

    return `${title}${stepType}${reason}`
  }

  formatFileSystemMutations(
    mutations: FileSystemMutation[],
    options: FileListOptions = {}
  ): string {
    const { limit = true, threshold = 5 } = options

    const lines: string[] = []

    const fileChanges = {
      create: 0,
      change: 0,
      delete: 0,
    }

    const dirChanges = {
      create: 0,
      change: 0,
      delete: 0,
    }

    const fsLines = []

    mutations.forEach((e) => {
      let bullet: string
      let message = e.path

      e.object === 'file' ? fileChanges[e.type]++ : dirChanges[e.type]++
      bullet = this.fileSystemSymbols[e.type]

      if (bullet && message) {
        fsLines.push(`🛢 ${bullet} ${message}`)
      }
    })

    if (limit && fsLines.length > threshold) {
      const sumLines = []
      Object.keys(fileChanges).forEach((type) => {
        if (fileChanges[type] !== 0) {
          sumLines.push(`🛢 ${this.fileSystemSymbols[type]} ${fileChanges[type]} files`)
        }
        if (dirChanges[type] !== 0) {
          sumLines.push(
            `🛢 ${this.fileSystemSymbols[type]} ${dirChanges[type]} directories`
          )
        }
      })
      lines.push(...sumLines)
    } else {
      lines.push(...fsLines)
    }

    return lines.join('\n')
  }

  formatContextMutations(mutations: ContextMutation[]) {
    const lines = []
    const added = []

    mutations.forEach((m) => {
      let bullet: string
      let type: string
      let subject: string
      if (m.type === 'add') {
        bullet = this.contextSymbols.add
        subject = m.key
      } else if (m.type === 'set') {
        bullet = this.contextSymbols.set
        subject = m.key
      }

      if (m.path === 'sources' || m.path === 'source') {
        type = 'source'
      } else if (m.path === 'targets' || m.path === 'target') {
        type = 'target'
      } else {
        type = m.path.split('.').at(-1)
      }

      if (bullet && type && subject && !added.includes(subject)) {
        lines.push(this.contextSymbols.mutation(bullet, type, subject))
      }

      if (m.type === 'add') {
        added.push(subject)
      }
    })

    return lines.join('\n')
  }

  formatJournalEntries(entries: JournalEntry[]) {
    const lines = []
    entries.forEach((entry) => {
      if (entry.private) return

      const bullet = this.journalFormatters.bullet(entry)
      let message: string

      if (entry.origin === 'flow') {
        if (entry.type === 'let') {
          message = this.journalFormatters.letEntry(entry)
        }
      }

      if (bullet && message) lines.push(`${bullet} ${message}`)
    })

    return lines.join('\n')
  }

  formatVersionControlMutations(mutations: VCSMutation[], options: FileListOptions = {}) {
    const { limit = true, threshold = 5 } = options

    const lines = []

    for (const entry of mutations) {
      if (entry.type === 'commit') {
        lines.push(this.vcsSymbols.title(entry))

        const changes = {
          create: 0,
          modify: 0,
          delete: 0,
        }

        const vcLines = []

        for (const f of entry?.changeset ?? []) {
          changes[f.mode]++
          vcLines.push(`⛓ ${this.vcsSymbols[f.mode]} ${f.file}`)
        }

        if (limit && vcLines.length > threshold) {
          const sumLines = []
          Object.keys(changes).forEach((type) => {
            if (changes[type] !== 0) {
              sumLines.push(`⛓ ${this.vcsSymbols[type]} ${changes[type]} files`)
            }
          })
          lines.push(...sumLines)
        } else {
          lines.push(...vcLines)
        }
      } else if (entry.type === 'init') {
        lines.push(this.vcsSymbols.title(entry))
      }
    }

    return lines.join('\n')
  }

  formatStepResult(stepResult: StepExecutionResult) {
    return [
      this.formatJournalEntries(stepResult.journal),
      this.formatContextMutations(stepResult.mutations.ctx),
      this.formatFileSystemMutations(stepResult.mutations.fs),
      this.formatVersionControlMutations(stepResult.mutations.vcs),
    ]
      .filter((section) => section && section.length)
      .join('\n')
  }
}
