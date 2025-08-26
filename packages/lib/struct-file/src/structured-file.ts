import { mergeLeft, PropertyPath } from '@whimbrel/walk'
import { KeyOrder } from './key-order'

export interface StructuredFileCtorParams<ModelFormat, SerializedFormat> {
  path: string
  storage: StorageAdapter
  keyOrder?: KeyOrder
  content: ModelFormat | SerializedFormat
}

export interface StructOptions {
  stripUnknown?: boolean
}

export interface StorageAdapter {
  write(path: string, content: any, opts?: any): Promise<void>
  writeJson(path: string, content: any, opts?: any): Promise<void>
}

export abstract class StructuredFile<ModelFormat = any, SerializedFormat = string> {
  protected path: string
  protected storage: StorageAdapter
  protected keyOrder: KeyOrder
  protected content: ModelFormat

  constructor({
    path,
    storage,
    keyOrder,
    content,
  }: StructuredFileCtorParams<ModelFormat, SerializedFormat>) {
    this.path = path
    this.storage = storage
    this.keyOrder = keyOrder
    this.content = this.deserializeContent(content)
  }

  abstract deserializeContent(content: ModelFormat | SerializedFormat): ModelFormat

  abstract containsAll(property: PropertyPath, values: any[]): boolean

  getContent(): ModelFormat {
    return this.content
  }

  abstract get<T = any>(property: PropertyPath, defaultValue?: T): T

  abstract set(property: PropertyPath, value: any): void

  assign(...values: any[]) {
    mergeLeft(this.content, ...values)
    this.enforceStructure()
  }

  abstract delete(property: PropertyPath): void

  abstract enforceStructure(opts?: StructOptions): void

  cleanAndReorder() {
    this.enforceStructure({ stripUnknown: true })
  }

  abstract write(): Promise<void>
}
