import { ExecutionStep, VCSMutation, WhimbrelContext } from '@whimbrel/core-api'
import { DefaultFormatter } from '@whimbrel/core'
import chalk from 'chalk'

export class CLIFormatter extends DefaultFormatter {
  constructor(ctx: WhimbrelContext) {
    super(ctx, {
      journal: {
        bullet: (_entry) => chalk.cyan('⇒'),
        letEntry: (entry) =>
          `${chalk.blue(entry.payload.name)}: ${chalk.cyan(entry.payload.value)}`,
      },
      mutations: {
        ctx: {
          add: chalk.green('⊕'),
          set: chalk.cyan('⇒'),
          mutation: (bullet: string, type: string, subject: string) =>
            `${bullet} ${chalk.magenta(type)}: ${chalk.cyan(subject)}`,
        },
        fs: {
          create: chalk.green('A'),
          modify: chalk.blue('M'),
          delete: chalk.magenta('R'),
        },
        vcs: {
          title: (mutation: VCSMutation) => {
            switch (mutation.type) {
              case 'init':
                return `${chalk.blue(mutation.type)}: ${chalk.cyan(mutation.repository)}`
              case 'commit':
                return `${chalk.blue(mutation.type)}: ${chalk.cyan(mutation.message?.trim())}`
            }
          },
          create: chalk.green('A'),
          modify: chalk.blue('M'),
          delete: chalk.magenta('R'),
        },
      },
    })
  }

  formatStepTitle(step: ExecutionStep) {
    const stepType = this.ctx.options.showStepIds ? ` (${chalk.dim(step.id)})` : ''

    let title = step.name
    let reason = ''

    if (step.treeState?.state === 'satisfied') {
      title = chalk.gray(title)
      reason = [
        chalk.gray(' ('),
        chalk.dim(step.treeState.reason ?? step.treeState.state),
        chalk.gray(')'),
      ].join('')
    }

    return `${title}${stepType}${reason}`
  }
}
