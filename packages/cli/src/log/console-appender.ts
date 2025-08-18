import ora from 'ora'
import chalk from 'chalk'
import stripAnsi from 'strip-ansi'
import { ApplicationLog, indent } from '@whimbrel/core-api'

/**
 * Default ConsoleAppender implementation of ApplicationLog, suitable
 * for Whimbrel as a CLI application.
 */
export class ConsoleAppender implements ApplicationLog {
  /**
   * Current indentation level of output. The value is not necessarily
   * the number of spaces of indentation that will be used - the implementation
   * of `indent` may use a multiplication factor, ie 2 spaces per indentation
   * level.
   */
  indentation = 0
  /**
   * Progress spinner use by the ConsoleAppender implementation of
   * semi-persistent status messages.
   */
  #spinner = ora('')
  /**
   * The current status/message parts of the status spinner.
   */
  #spinnerStatus = {
    baseText: '',
    additionalText: '',
  }

  /**
   * Used to temporarily disable the ora spinner while outputting to the
   * console in order to not confuse ora and leave traces of old spinners
   * in the console.
   *
   * @param fn - the output operation to perform while the spinner is disabled.
   */
  #deferSpinner(fn: () => void) {
    const spinning = this.#spinner.isSpinning
    if (spinning) {
      this.#spinner.stop()
    }
    fn()
    if (spinning) {
      this.#spinner.start()
    }
  }

  info(...args: any[]) {
    this.#deferSpinner(() => {
      console.log(...[indent(this.indentation, ''), ...args])
    })
  }

  warn(...args: any[]) {
    this.#deferSpinner(() => {
      console.warn(...args)
    })
  }

  error(...args: any[]) {
    this.#deferSpinner(() => {
      console.error(...args)
    })
  }

  debug(...args: any[]) {
    this.#deferSpinner(() => {
      console.debug(...args)
    })
  }

  /**
   * Outputs a banner-like section, using `chalk` to add color to the
   * title parts.
   *
   * The first argument is the main title, the second is a subtitle,
   * and the third is an optional additional text.
   *
   * The title is indented according to the current indentation level,
   * and the title parts are separated by a prefix (default is an empty string).
   * The first part is not decorated, the second part is green, and the third
   * part is blue.
   *
   * @param args - The title parts to display, up to three parts.
   * @param args[0] - The main title.
   * @param args[1] - The subtitle (optional).
   * @param args[2] - Additional text (optional).
   */
  banner(...args: string[]) {
    const prefixes = ['', ': ', ' - ']
    const decorators = [
      (s: string) => s,
      (s: string) => chalk.green(s),
      (s: string) => chalk.blue(s),
    ]
    const title = args.reduce((result, arg, i) => {
      if (arg === undefined) return result
      const prefix = prefixes[Math.min(i, prefixes.length - 1)]
      const decorator = decorators[Math.min(i, decorators.length - 1)]
      return `${result}${prefix}${decorator(arg)}`
    }, '')
    console.log(indent(this.indentation, title))
    console.log(indent(this.indentation, '-'.repeat(stripAnsi(title).length)))
  }

  /**
   * Display a status message using a spinner.
   *
   * @param statusText - The text to display in the spinner. If not provided,
   * the spinner will just start without any text.
   * If provided, it will be set as the base text of the spinner.
   * If the spinner is already spinning, it will update the text.
   *
   * @remarks
   * This method is used to show a semi-persistent status message
   * that can be updated or hidden later.
   */
  showStatus(statusText?: string) {
    if (statusText && typeof statusText === 'string') {
      this.#spinner.text = statusText
      this.#spinnerStatus.baseText = statusText
      this.#spinnerStatus.additionalText = ''
    }
    this.#spinner.start()
  }

  /**
   * Hide the status spinner.
   *
   * @remarks
   * This method stops the spinner if it is currently spinning.
   * It is typically used to hide the status message after the operation is
   * complete or when the status is no longer needed.
   *
   * Starting the spinner again with `showStatus` without any arguments
   * while restore the spinner with the previous text.
   */
  hideStatus() {
    if (this.#spinner.isSpinning) {
      this.#spinner.stop()
    }
  }

  /**
   * Update the status text of the spinner.
   *
   * This method allows you to change the text displayed by the spinner
   * without stopping it.
   */
  updateStatus(statusText: string) {
    this.#spinnerStatus.baseText = statusText
    this.#spinner.text = `${this.#spinnerStatus.baseText} ${this.#spinnerStatus.additionalText}`
  }

  /**
   * Increase the indentation level for subsequent output.
   */
  indent() {
    this.indentation++
  }

  /**
   * Decrease the indentation level for subsequent output.
   * The indentation level will not go below 0.
   */
  deindent() {
    this.indentation = Math.max(0, this.indentation - 1)
  }
}
