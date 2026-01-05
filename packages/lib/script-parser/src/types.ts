/**
 * Type definition for a parser grammar.
 */
export type Grammar<IR = any, Emittable = any, Wrappable = any> = {
  /**
   * The output IR type of this grammar.
   */
  Output: IR
  /**
   * Type of symbols and concepts that can be emitted by a parser to
   * shape an instance of IR. Usually a union type of string keywords.
   *
   * Used by state machine grammars to describe side-effects of transitioning
   * between states.
   */
  Emittable: Emittable
  /**
   * Type of symbols and concepts that can be emitter by a parser to
   * signal that a concept is wrapping the current or previously collected
   * information.
   *
   * Used by state machine grammars to signal that wrapping of an output
   * node should happen, and of what kind.
   */
  Wrappable: Wrappable
}

/**
 * A lexical token. The smallest parse:able unit.
 */
export interface Token {
  /**
   * The type of token.
   */
  type: string
  /**
   * The literal text content of the token.
   */
  text: string
}

/**
 * A tokenizer that can convert an instance of InputType to
 * tokens suitable for parsing.
 *
 * The templated Input allows for other token sources
 * than string input.
 *
 * @template InputType - The type of input to tokenize
 */
export interface Tokenizer<Input = string> {
  /**
   * Tokenize a input into tokens.
   *
   * @param input - The input to tokenize
   *
   * @returns An array of tokens
   */
  tokenize: (input: Input) => Token[]
}

export interface Parser<Input = string, IR = any> {
  /**
   * Parse input into the IR format of this parser instance.
   *
   * @param input - The input to parse
   *
   * @returns An array of parsed output instances
   */
  parse: (input: Input) => IR[]
}
