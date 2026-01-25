import {
  containsAll,
  deletePath,
  PropertyPath,
  readPath,
  writePath,
} from '@whimbrel/walk'
import { enforceKeyOrder, StructuredFile } from '.'
import { StructOptions, StructuredFileCtorParams } from './structured-file'
import path from 'node:path'

export class JSONFile extends StructuredFile<any, string> {
  constructor(params: StructuredFileCtorParams<any, string>) {
    super(params)
  }

  containsAll(property: PropertyPath, values: any[]) {
    return containsAll(this.content, property, values)
  }

  deserializeContent(content: any | string) {
    if (typeof content === 'string') {
      try {
        return JSON.parse(content)
      } catch (e) {
        const source = this.path ?? '(anonymous)'
        const message = e.message ?? '(no error message)'
        throw new Error(`Unable to parse JSON file: ${source} - ${message}`)
      }
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

  async write(filePath?: string | string[]) {
    if (!this.storage) {
      throw new Error('No storage attached to this instance.')
    }
    if (Array.isArray(filePath)) {
      filePath = path.join(...filePath)
    }
    return this.storage.writeJson(filePath ?? this.path, this.content)
  }
}
