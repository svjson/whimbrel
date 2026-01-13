import path from 'node:path'
import {
  FacetQueryFunction,
  FunctionInvocationDescription,
  WhimbrelContext,
} from '@whimbrel/core-api'
import { getLiteral, locateInvocations, resolveInvocationArguments } from '@src/lib'
import type {
  ValueExpression,
  EnvironmentVariableReference,
  ExpressionReference,
  IdentifierReference,
  ProcessArgumentReference,
  InvocationExpressionReference,
  ExpressionResolution,
} from '@src/lib'
import { ObjectReference, SyntheticValue } from '@src/lib/reference'

const ARG_FORMAT: Record<string, (arg: ExpressionResolution) => any> = {
  literal: (arg) => ({
    type: arg.category,
    literal: getLiteral(arg),
    value: arg.category === 'literal' ? arg.value : undefined,
  }),
  expression: (arg) => ({
    type: arg.category,
    literal: getLiteral(arg),
    resolutions: (arg as ExpressionReference).resolutions.map(format),
  }),
  'builtin-funcall': (arg) => ({
    type: arg.category,
    literal: getLiteral(arg),
    name: (arg as InvocationExpressionReference).name,
    arguments: (arg as InvocationExpressionReference).arguments.map(format),
    resolutions: (arg as InvocationExpressionReference).resolutions.map(format),
  }),
  'process-arg': (arg) => ({
    type: 'process-arg',
    literal: getLiteral(arg),
    argIndex: (arg as unknown as ProcessArgumentReference).argIndex.map(format),
  }),
  'process-env': (arg) => ({
    type: 'process-env',
    literal: getLiteral(arg),
    name: (arg as unknown as EnvironmentVariableReference).name.map(format),
  }),
  Identifier: (arg) => ({
    type: 'symbol',
    name: (arg as unknown as IdentifierReference).name,
    resolutions: (arg as ExpressionReference).resolutions.map(format),
  }),
  ObjectExpression: (arg) => ({
    type: 'object',
    literal: getLiteral(arg),
    properties: (arg as ObjectReference).entries.map((e) => ({
      key: e.name,
      value: format(e.value),
    })),
  }),
  SyntheticValue: (arg: SyntheticValue) => ({
    type: arg.category,
    literal: String(arg.value),
    value: arg.value,
  }),
}

const format = (expr: ValueExpression) =>
  ARG_FORMAT[expr.type]
    ? ARG_FORMAT[expr.type](expr)
    : ARG_FORMAT[expr.category]
      ? ARG_FORMAT[expr.category](expr)
      : { type: expr.category }

/**
 * Query implementation of `language:invocation`.
 *
 * @param _ctx - The Whimbrel context.
 * @param query - The FacetQuery containing the actor and criteria.
 */
export const queryLanguageInvocation: FacetQueryFunction<'language:invocation'> = async (
  ctx: WhimbrelContext,
  { actor, criteria }
) => {
  let { functionInvocation, sourceFolders } = criteria

  if (!sourceFolders || !sourceFolders.length) {
    sourceFolders = [path.join(actor.root, 'src')]
  }

  const invocations = await Promise.all(
    (await locateInvocations(ctx, sourceFolders, functionInvocation)).map(
      resolveInvocationArguments
    )
  )

  return invocations.map((inv) => ({
    language: 'typescript',
    description: functionInvocation,
    arguments: inv.arguments.map(format),
  }))
}
