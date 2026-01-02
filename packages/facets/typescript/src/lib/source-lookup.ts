import path from 'node:path'
import type {
  FunctionInvocationDescription,
  ImportSourceDescription,
  InstanceDescription,
  WhimbrelContext,
} from '@whimbrel/core-api'
import { listSourceFiles, matchesImportSource } from './source-tree'
import { AST, filePathToAST, findRecursive, getNodeLiteral, isLiteralNode } from './ast'
import type { Node, VariableDeclaration, VariableDeclarator } from '@babel/types'
import {
  InstanceDeclaration,
  IdentifierImportReference,
  LiteralReference,
  SourceReference,
  ExpressionReference,
  ValueExpression,
  InvocationExpressionReference,
  IdentifierAssignment,
} from './reference'
import { makeLiteral } from './literal'
import { makeObjectReference } from './object'

/**
 * Locate instance declarations in source files within specified source folders
 *
 * @param ctx - The Whimbrel context
 * @param sourceFolders - Array of source folder paths to scan
 * @param instance - The instance description to locate
 *
 * @return Array of located instance declarations
 */
export const locateInstance = async (
  ctx: WhimbrelContext,
  sourceFolders: string[],
  instance: InstanceDescription
): Promise<InstanceDeclaration[]> => {
  const sourceFiles = await listSourceFiles(ctx, sourceFolders)
  const found = []

  for (const file of sourceFiles) {
    found.push(...(await locateInstanceInSourceFile(ctx, file, instance)))
  }

  return found
}

/**
 * Find any instances of `node` being exported from the current source file/AST.
 *
 * @param ast - The AST to search
 * @param node - The variable declaration node to check for exports
 * @param identifier - The identifier name of the variable declaration
 *
 * @return Array of export metadata for the variable declaration
 */
export const findExports = (ast: AST, node: VariableDeclaration, identifier: string) => {
  const exportDeclarations = findRecursive(ast.nodes, [
    'ExportNamedDeclaration',
    'ExportDefaultDeclaration',
  ])

  return exportDeclarations.reduce((exports, exp) => {
    if (exp.type === 'ExportNamedDeclaration') {
      if (exp.declaration === node) {
        exports.push({
          type: 'named',
          name: identifier,
        })
      }
    } else if (exp.type == 'ExportDefaultDeclaration') {
      if (exp.declaration.type === 'Identifier' && exp.declaration.name === identifier) {
        exports.push({
          type: 'default',
        })
      }
    }
    return exports
  }, [])
}

/**
 * Find import statements matching the provided ImportSourceDescription.
 *
 * @param ast - The AST to search
 * @param source - The import source description to match
 *
 * @return Array of located import references
 */
export const findImportBySource = (
  ast: AST,
  source: ImportSourceDescription
): IdentifierImportReference[] => {
  return ast.nodes.reduce((nodes, node) => {
    if (
      node.type === 'ImportDeclaration' &&
      node.importKind === 'value' &&
      matchesImportSource(source, node.source.value, path.dirname(ast.sourceFile ?? '/'))
    ) {
      if (source.importType === 'default') {
        const defaultSpecifier = node.specifiers.find(
          (s) => s.type === 'ImportDefaultSpecifier'
        )
        if (defaultSpecifier) {
          nodes.push({
            type: 'ImportDeclaration',
            name: defaultSpecifier.local.name,
            importType: 'default',
            ast,
            node,
          })
        }
      }

      if (source.importType === 'named') {
        const importSpecifier = node.specifiers.find((s) => s.type === 'ImportSpecifier')

        if (importSpecifier) {
          nodes.push({
            type: 'ImportDeclaration',
            name: importSpecifier.local.name,
            importType: 'named',
            ast,
            node,
          })
        }
      }
    }
    return nodes
  }, [])
}

/**
 * Find origin of imported `identifier`, if any.
 *
 * @param ast - The AST to search
 * @param identifier - The identifier name to locate
 *
 * @return The located import reference, if any
 */
export const findImportedIdentifier = (
  ast: AST,
  identifier: string
): IdentifierImportReference | undefined => {
  for (const node of findRecursive(ast.nodes, 'ImportDeclaration')) {
    if (node.type === 'ImportDeclaration' && node.importKind === 'value') {
      const importSpecifiers = findRecursive(node, [
        'ImportSpecifier',
        'ImportDefaultSpecifier',
      ])
      for (const impSpec of importSpecifiers) {
        if (
          impSpec.type === 'ImportSpecifier' ||
          impSpec.type === 'ImportDefaultSpecifier'
        ) {
          if (impSpec.local.name === identifier) {
            return {
              type: 'ImportDeclaration',
              name: identifier,
              importType: impSpec.type === 'ImportSpecifier' ? 'named' : 'default',
              ast,
              node,
            }
          }
        }
      }
    }
  }

  return undefined
}

/**
 * Locate variable declarations matching the instance description in the AST
 *
 * @param ast - The AST to search
 * @param type - The type reference of the instance
 * @param instance - The instance description
 */
export const findVariableDeclarations = (
  ast: AST,
  lhs: { identifier?: string },
  rhs: { newInstanceOf?: string; returnValueOf?: string }[]
): InstanceDeclaration[] => {
  const matchesLHS = (node: VariableDeclarator) => {
    if (lhs.identifier) {
      if (!(node.id.type === 'Identifier' && node.id.name === lhs.identifier)) {
        return false
      }
    }
    return true
  }

  const matchesRHS = (node: VariableDeclarator) => {
    for (const rhsCrit of rhs) {
      if (rhsCrit.newInstanceOf) {
        if (
          !(
            node.init &&
            node.init.type === 'NewExpression' &&
            node.init.callee.type === 'Identifier' &&
            node.init.callee.name === rhsCrit.newInstanceOf
          )
        )
          return false
      }

      if (rhsCrit.returnValueOf) {
        !(
          node.init &&
          node.init.type === 'CallExpression' &&
          node.init.callee.type === 'Identifier' &&
          node.init.callee.name === rhsCrit.returnValueOf
        )
      }
    }
    return true
  }

  return findRecursive(ast.nodes, 'VariableDeclaration').reduce((declarations, node) => {
    if (node.type == 'VariableDeclaration') {
      declarations.push(
        ...node.declarations
          .filter(matchesLHS)
          .filter(matchesRHS)
          .map((n) => {
            const identifier = n.id.type === 'Identifier' ? n.id.name : ''

            const expression: ValueExpression = n.init
              ? {
                  type: n.init.type,
                  category: 'expression',
                  resolutions: [],
                  node: n.init,
                  ast,
                }
              : {
                  type: n.type,
                  category: 'expression',
                  resolutions: [],
                  node: n,
                  ast,
                }

            return {
              type: 'VariableDeclaration',
              name: identifier,
              exports: findExports(ast, node, identifier),
              expression: expression,
              node,
              ast,
            } satisfies InstanceDeclaration
          })
      )
    }
    return declarations
  }, [] as InstanceDeclaration[])
}

/**
 * Describe the babel AST node as ValueExpression
 *
 * @param ast - The AST containing the value expression
 * @param a - The argument node to describe
 *
 * @return The described ValueEpression
 */
export const describeValueExpression = (ast: AST, a: Node): ValueExpression => {
  if (isLiteralNode(a)) {
    return makeLiteral(ast, a) as LiteralReference
  }

  if (a.type === 'Identifier') {
    return {
      type: 'Identifier',
      name: a.name,
      category: 'expression',
      resolutions: [],
      node: a,
      ast,
    }
  }

  if (a.type === 'ObjectExpression') {
    return makeObjectReference(ast, a)
  }

  return {
    type: a.type,
    category: 'expression',
    resolutions: [],
    node: a,
    ast,
  } as ExpressionReference
}

/**
 * Locate call expressions matching the invocation description in the AST
 *
 * @param instanceRef - The instance declaration reference
 * @param invocation - The function invocation description
 *
 * @return Array of located call expressions
 */
export const findCallExpression = (
  instanceRef: IdentifierAssignment,
  invocation: FunctionInvocationDescription
): InvocationExpressionReference[] => {
  return instanceRef.ast.nodes
    .reduce((calls, n) => {
      calls.push(...findRecursive(n, 'CallExpression'))
      return calls
    }, [])
    .reduce((result, expr) => {
      if (
        expr.callee.type === 'MemberExpression' &&
        expr.callee.object.type === 'Identifier' &&
        expr.callee.object.name === instanceRef.name &&
        expr.callee.property.type === 'Identifier' &&
        expr.callee.property.name === invocation.name
      ) {
        result.push({
          type: 'CallExpression',
          name: invocation.name,
          arguments: expr.arguments.map((a) =>
            describeValueExpression(instanceRef.ast, a)
          ),
          node: expr,
          ast: instanceRef.ast,
        })
      }
      return result
    }, [])
}

/**
 * Locate instance declarations in the AST of a specific source file
 * or snippet
 *
 * @param ctx - The Whimbrel context
 * @param filePath - The path to the source file
 * @param instance - The instance description to locate
 *
 * @return Array of located instance declarations
 */
export const locateImportedInstanceInAST = (
  ast: AST,
  instance: InstanceDescription
): IdentifierAssignment[] => {
  const importStatements = instance.from
    ? findImportBySource(ast, instance.from)
    : [findImportedIdentifier(ast, instance.name)].filter(Boolean)

  if (instance.type === 'class' || instance.type === 'return-value') {
    return importStatements.reduce((instanceDeclarations, impStmt) => {
      instanceDeclarations.push(
        ...findVariableDeclarations(ast, {}, [
          instance.type === 'class'
            ? { newInstanceOf: impStmt.name }
            : { returnValueOf: impStmt.name },
        ])
      )
      return instanceDeclarations
    }, [])
  } else if (instance.type === 'identifier') {
    return importStatements.reduce((statements, impStmt) => {
      if (impStmt.name === instance.name || impStmt.importType === 'default') {
        statements.push(impStmt)
      }
      return statements
    }, [])
  }

  return []
}

/**
 * Locate instance declarations in the AST of a specific source file
 * or snippet
 *
 * @param ctx - The Whimbrel context
 * @param filePath - The path to the source file
 * @param instance - The instance description to locate
 *
 * @return Array of located instance declarations
 */
export const locateInstanceInAST = (
  ast: AST,
  instance: InstanceDescription
): IdentifierAssignment[] => {
  const imported = locateImportedInstanceInAST(ast, instance)
  const declared = instance.from
    ? []
    : findVariableDeclarations(ast, { identifier: instance.name }, [])

  return [...imported, ...declared]
}

/**
 * Locate function invocations in source files within specified source folders
 *
 * @param ctx - The Whimbrel context
 * @param sourceFolders - Array of source folder paths to scan
 * @param invocation - The function invocation description to locate
 *
 * @return Array of located call expressions
 */
export const locateInstanceInSourceFile = async (
  ctx: WhimbrelContext,
  filePath: string,
  instance: InstanceDescription
): Promise<SourceReference[]> => {
  const ast = await filePathToAST(ctx, filePath)

  return locateInstanceInAST(ast, instance)
}

/**
 * Locate function invocations in the AST given instance declarations
 *
 * @param objectRefs - Array of instance declaration references
 * @param invocation - The function invocation description to locate
 *
 * @return Array of located call expressions
 */
export const locateInvocationsInAST = (
  objectRefs: IdentifierAssignment[],
  invocation: FunctionInvocationDescription
): InvocationExpressionReference[] => {
  return objectRefs.reduce((invocations, objRef) => {
    invocations.push(...findCallExpression(objRef, invocation))
    return invocations
  }, [])
}

/**
 * Locate function invocations in source files within specified source folders
 *
 * @param ctx - The Whimbrel context
 * @param sourceFolders - Array of source folder paths to scan
 * @param invocation - The function invocation description to locate
 */
export const locateInvocations = async (
  ctx: WhimbrelContext,
  sourceFolders: string[],
  invocation: FunctionInvocationDescription
): Promise<InvocationExpressionReference[]> => {
  const objectRefs = await locateInstance(ctx, sourceFolders, invocation.instance)
  const localInvocations = locateInvocationsInAST(objectRefs, invocation)
  const imported = []

  for (const ref of objectRefs) {
    if (Array.isArray(ref.exports)) {
      for (const exportDef of ref.exports) {
        imported.push(
          ...(await locateInvocations(ctx, sourceFolders, {
            ...invocation,
            instance: {
              type: 'identifier',
              name: ref.name,
              from: {
                type: 'tree',
                name: ref.ast.sourceFile,
                importType: exportDef.type,
              },
            },
          }))
        )
      }
    }
  }

  ctx.log.deindent()
  return [...localInvocations, ...imported]
}
