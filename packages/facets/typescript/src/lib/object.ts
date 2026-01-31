import { Identifier, MemberExpression, ObjectExpression } from '@babel/types'
import {
  ObjectEntryReference,
  ObjectPathReference,
  ObjectReference,
  ValueExpression,
} from './reference'
import { AST, ObjectPathPart } from './ast'
import { describeValueExpression } from './source-lookup'
import { resolveExpression } from './expression'
import { WhimbrelError } from '@whimbrel/core-api'

/**
 * Creates an object reference from an object expression AST node
 *
 * @param ast - The AST containing the object expression
 * @param node - The object expression AST node
 *
 * @return The created ObjectReference
 */
export const makeObjectReference = (
  ast: AST,
  node: ObjectExpression
): ObjectReference => {
  const entries: ObjectEntryReference[] = []

  for (const prop of node.properties) {
    if (prop.type === 'ObjectProperty') {
      if (prop.key.type == 'Identifier') {
        entries.push({
          type: 'ObjectProperty',
          name: prop.key.name,
          value: describeValueExpression(ast, prop.value),
          category: 'entry',
          node: prop,
          ast,
        })
      } else if (prop.key.type === 'StringLiteral') {
        entries.push({
          type: 'ObjectProperty',
          name: prop.key.value,
          value: describeValueExpression(ast, prop.value),
          category: 'entry',
          node: prop,
          ast,
        })
      }
    }
  }

  return {
    type: 'ObjectExpression',
    category: 'expression',
    entries,
    resolutions: [],
    node,
    ast,
  }
}

/**
 * Creates an ObjectPathReference from a MemberExpression.
 *
 * This mechanism is a work in progress, but the general idea is
 * currently that it holds a reference to root of the MemberExpression
 * and full path to the most specific identifier, so that it can be
 * resolved and evaluated independently and as needed.
 *
 * @param ast - The AST containing the expression
 * @param node - The MemberExpression AST node
 *
 * @return The created ObjectPathReference
 */
export const makeObjectPathReference = (
  ast: AST,
  node: MemberExpression
): ObjectPathReference => {
  const extractPath = (
    memExpr: MemberExpression
  ): { root: Identifier; path: ObjectPathPart[] } => {
    if (memExpr.object.type === 'MemberExpression') {
      const { root, path } = extractPath(memExpr.object)
      return { root, path: [...path, memExpr.property] }
    }

    if (memExpr.object.type === 'Identifier') {
      const root = memExpr.object
      const path = memExpr.property

      return { root, path: [path] }
    }

    throw new WhimbrelError(`Unhandled MemberExpression object: '${memExpr.object.type}'`)
  }

  const { root, path } = extractPath(node)

  return {
    type: 'ObjectPathReference',
    category: 'expression',
    root,
    path,
    resolutions: [],
    ast,
    node,
  }
}

/**
 * Gets the value of a property from an object reference
 *
 * @param obj - The object reference
 * @param prop - The property identifier
 *
 * @return The value expression of the property, or undefined if not found
 */
const getObjectPropertyValue = (
  obj: ObjectReference,
  prop: Identifier
): ValueExpression | undefined => {
  const property = obj.entries.find((e) => e.name === prop.name)
  return property?.value
}

/**
 * Recursively extracts a value expression from an object reference
 * based on a given path.
 *
 * Path traversal is cancelled in case any intermediate part of the
 * resolution is not present or not supported.
 *
 * @param obj - The object reference
 * @param path - The path to extract
 *
 * @return The extracted value expression, or undefined if not found
 */
export const extractObjectPath = (
  obj: ObjectReference,
  path: ObjectPathPart[]
): ValueExpression | undefined => {
  const remainingPath = [...path]
  const next = remainingPath.shift()
  if (!next) return

  const nextValue = getObjectPropertyValue(obj, next as Identifier)
  if (!nextValue) return

  if (nextValue.type === 'ObjectExpression') {
    return extractObjectPath(nextValue as ObjectReference, remainingPath)
  }

  return nextValue
}

/**
 * Recursively resolves the properties of an object reference
 *
 * @param object - The object reference to resolve
 * @return Promise that resolves when the properties have been resolved
 */
export const resolveObjectProperties = async (object: ObjectReference) => {
  for (const entry of object.entries) {
    if (entry.value.category === 'expression') {
      // FIXME: This little asymmetry here is result of the expression tree
      // and resolution tree models doesn't work for nested values, like this.
      //
      // Currently, and ObjectReference/ObjectExpression has known properties
      // and there is only one resolution. Rather than exploding the tree size
      // we are simply replacing the value with the resolution. There can only
      // ever be one, and we don't want every single level of a nested object
      // to duplicate the entire sub-tree.
      //
      const resolutions = await resolveExpression(object.ast, entry.value.node, {
        nodeRef: entry.value,
      })
      if (entry.value.type === 'ObjectExpression' && resolutions.length === 1) {
        entry.value = resolutions[0] as ObjectReference
      } else {
        entry.value.resolutions = resolutions
      }
    }
  }
}
