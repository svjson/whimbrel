import { PropertyPath } from '@whimbrel/walk'
import {
  asArrayPath,
  StructOptions,
  StructuredFile,
  StructuredFileCtorParams,
} from './structured-file'

import { isDocument, parseDocument, Document, Scalar, Node } from 'yaml'

const walkYamlPath = (
  yamlNode: Node | Document<Node>,
  propertyPath: PropertyPath
): any => {
  if (typeof propertyPath === 'string') {
    propertyPath = propertyPath.split('.')
  }

  const [thisSeg, ...rest] = propertyPath
  if (typeof (yamlNode as Document<Node>).get !== 'function') return undefined
  const thisVal = (yamlNode as Document<Node>).get(thisSeg)
  if (!rest.length || thisVal === null || thisVal === undefined) return thisVal
  return walkYamlPath(thisVal as Node, rest)
}

export class YamlFile extends StructuredFile<Document<Node>> {
  constructor(params: StructuredFileCtorParams<Document<Node>, string>) {
    super(params)
  }

  deserializeContent(content: any): Document<Node> {
    if (typeof content === 'string') {
      return parseDocument(content)
    }

    if (isDocument(content)) {
      return content
    }
  }

  get<T>(property: PropertyPath): T {
    const value = walkYamlPath(this.content, asArrayPath(property))
    if (typeof value === 'string') return value as T
    if (typeof value?.toJS === 'function') return value.toJS(this.content)
    if (value === null || value === undefined) return value

    throw new Error(`Unsupported Yaml entry at ${property}: ${value}`)
  }

  set(property: PropertyPath, value: any) {
    property = asArrayPath(property)
    this.content.setIn(property, value)
  }

  containsAll(property: PropertyPath, values: any[]): boolean {
    throw new Error('Method not implemented.')
  }
  delete(property: PropertyPath): void {
    throw new Error('Method not implemented.')
  }
  enforceStructure(opts?: StructOptions): void {
    throw new Error('Method not implemented.')
  }
  write(): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
