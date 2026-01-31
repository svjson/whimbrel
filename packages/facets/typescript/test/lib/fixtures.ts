import { SourceReference } from '@src/lib'
import {
  ExpressionResolution,
  ObjectEntryReference,
  ObjectReference,
  SyntheticValue,
  SyntheticValueMap,
  SyntheticValueType,
  ValueExpression,
} from './reference'

export const stripASTDetails = (
  refs: (SourceReference | SyntheticValue) | (SourceReference | SyntheticValue)[],
  keep: string[] = []
) => {
  if (Array.isArray(refs)) {
    return refs.map((r) => stripASTDetails(r, keep))
  }

  const dupe = { ...refs } as any
  ;['id', 'type', 'ast', 'node', 'nodePath'].forEach((key) => {
    if (!keep.includes(key)) delete dupe[key]
  })
  if (dupe.value && typeof dupe.value === 'object' && dupe.value.type) {
    dupe.value = stripASTDetails(dupe.value, keep)
  }
  if (dupe.argument?.node && !keep.includes('node')) {
    delete dupe.argument.node
  }
  ;['name', 'entries', 'arguments', 'argIndex', 'resolutions'].forEach((key) => {
    if (Array.isArray(dupe[key]) && !keep.includes(key))
      dupe[key] = stripASTDetails(dupe[key], keep)
  })
  return dupe
}

export const expressionTree = (...keep: string[]) => {
  return {
    literal: (value: any): ValueExpression => {
      const type =
        typeof value === 'number'
          ? 'NumericLiteral'
          : typeof value === 'string'
            ? 'StringLiteral'
            : 'BooleanLiteral'

      return stripASTDetails(
        {
          type,
          category: 'literal',
          value,
        } as ValueExpression,
        keep
      )
    },

    property: (
      name: string,
      value: Partial<ValueExpression>
    ): Partial<ObjectEntryReference> =>
      stripASTDetails(
        {
          type: 'ObjectProperty',
          category: 'entry',
          name,
          value: value as ValueExpression,
        } as ObjectEntryReference,
        keep
      ),

    obj: (
      entries: Partial<ObjectEntryReference>[],
      ...resolutions: Partial<ExpressionResolution>[]
    ): Partial<ObjectReference> =>
      stripASTDetails(
        {
          type: 'ObjectExpression',
          category: 'expression',
          entries: entries as ObjectEntryReference[],
          resolutions: resolutions as ExpressionResolution[],
        } as ObjectReference,
        keep
      ),

    synthetic: <NT extends SyntheticValueType>(
      type: NT,
      value: SyntheticValueMap[NT]
    ): SyntheticValue<NT> =>
      stripASTDetails(
        {
          type: 'SyntheticValue',
          category: 'literal',
          value,
          valueType: type,
        } as SyntheticValue<NT>,
        keep
      ),
  }
}
