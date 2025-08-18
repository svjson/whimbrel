import chalk from 'chalk'

import { ExecutionStep, Formatter, WhimbrelContext } from '@whimbrel/core-api'

export class CLIFormatter implements Formatter {
  constructor(private ctx: WhimbrelContext) {}

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
