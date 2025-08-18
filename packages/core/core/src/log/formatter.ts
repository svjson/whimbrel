import { ExecutionStep, Formatter, WhimbrelContext } from '@whimbrel/core-api'

/**
 * Default formatter for headless runs.
 *
 * Produces plain text output without ANSI codes.
 */
export class DefaultFormatter implements Formatter {
  constructor(private ctx: WhimbrelContext) {}

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
}
