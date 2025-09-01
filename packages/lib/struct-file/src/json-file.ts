import {
  containsAll,
  deletePath,
  PropertyPath,
  readPath,
  writePath,
} from '@whimbrel/walk'
import { enforceKeyOrder, StructuredFile } from '.'
import { StructOptions, StructuredFileCtorParams } from './structured-file'

export class JSONFile extends StructuredFile<any, string> {
  constructor(params: StructuredFileCtorParams<any, string>) {
    super(params)
  }

  containsAll(property: PropertyPath, values: any[]) {
    return containsAll(this.content, property, values)
  }

  deserializeContent(content: any | string) {
    if (typeof content === 'string') {
      return JSON.parse(content)
    }

    if (typeof content === 'object') {
      return content
    }

    throw new Error(`Unsupported content type for JSONFile: ${typeof content}`)
  }

  get<T>(property: PropertyPath, defaultValue?: T): T {
    return readPath(this.content, property) ?? defaultValue
  }

  set(property: PropertyPath, value: any) {
    writePath(this.content, property, value)
    this.enforceStructure()
  }

  delete(property: PropertyPath) {
    deletePath(this.content, property)
  }

  enforceStructure(opts?: StructOptions): void {
    this.content = enforceKeyOrder(this.content, this.keyOrder, opts?.stripUnknown)
  }

  async write() {
    if (!this.storage) {
      throw new Error('No storage attached to this instance.')
    }
    return this.storage.writeJson(this.path, this.content)
  }
}
