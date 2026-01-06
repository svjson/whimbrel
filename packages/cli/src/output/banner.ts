import { indent } from '@whimbrel/core-api'
import stripAnsi from 'strip-ansi'

/**
 * Options for creating a banner.
 */
export type BannerOptions = {
  /**
   * The banner message, optionally split into segments to be prefixed
   * and decorated individually
   */
  message: string[]
  /**
   * The indentation level to apply to the banner lines
   */
  indentation: number
  /**
   * Prefixes to apply to each segment of the message.
   */
  prefixes: string[]
  /**
   * Decorators to apply to each segment of the message.
   */
  decorators: ((s: string) => string)[]
}

/**
 * Creates banner-like lines of text from message input and formatting
 * options.
 *
 * Prefixes and decorators can be used to format or apply ansi color
 * escape codes to each segment of the message individually.
 *
 * The first element of `message` will be prefixed with the first
 * element of `prefixes` and formatted/decorated using the first
 * element of `decorators`, and the second part will then use the
 * second element of each array, and so on.
 *
 * If the number of message segments exceeds the provided prefixes
 * or decorators, overshooting segments will use the last element
 * of each array.
 *
 * The resulting banner consists of two lines: the first line
 * contains the formatted message, and the second line is a
 * underline made of dashes matching the length of the
 * first line (excluding any ANSI escape codes).
 *
 * @param opts - The banner options.
 *
 * @return An array of strings representing the banner lines.
 */
export const banner = (opts: BannerOptions): string[] => {
  const { message, indentation, prefixes, decorators } = opts

  const title = message.reduce((result, arg, i) => {
    if (arg === undefined) return result
    const prefix = prefixes[Math.min(i, prefixes.length - 1)] ?? ''
    const decorator = decorators[Math.min(i, decorators.length - 1)] ?? ((s: string) => s)
    return `${result}${prefix}${decorator(arg)}`
  }, '')

  return [
    indent(indentation, title),
    indent(indentation, '-'.repeat(stripAnsi(title).length)),
  ]
}
