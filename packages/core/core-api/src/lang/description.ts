/**
 * Enum union type describing types of import statements
 */
export type ImportType = 'default' | 'named'
/**
 * Enum union type describing the source of an import statement
 */
export type ImportSourceType = 'library' | 'tree'
/**
 * Enum union type describing the value instance of variable declaration
 */
export type InstanceType = 'class' | 'identifier' | 'return-value'

export interface ImportDescriptionBase {
  /**
   * Type of source
   */
  type: ImportSourceType
  /**
   * Name/path of the source/library
   */
  name: string
  /**
   * Import type of the source/library
   */
  importType: ImportType
}

export interface DefaultImportDescription extends ImportDescriptionBase {
  importType: 'default'
}

export interface NamedImportDescription extends ImportDescriptionBase {
  importType: 'named'
  importName: string
}

/**
 * Describes the source from which an entity/identifier is imported.
 */
export type ImportSourceDescription = DefaultImportDescription | NamedImportDescription

/**
 * Describes the criterion for referencing an instance declaration
 * in an unknown location.
 */
export type InstanceDescription = {
  /**
   * Instance type
   */
  type: InstanceType
  /**
   * Name of the entity of `type`.
   */
  name: string
  /**
   * Source of the entity being referenced.
   */
  from?: ImportSourceDescription
}

export interface MemberFunctionInvocationDescription {
  /**
   * The function name
   */
  name: string
  /**
   * The function type
   */
  type: 'instance'
  /**
   * Instance description
   */
  instance: InstanceDescription
}

export interface FreeFunctionInvocationDescription {
  /**
   * The function name
   */
  name: string
  /**
   * The function type
   */
  type: 'function'
  /**
   * Function source/origin
   */
  from?: ImportSourceDescription
}

/**
 * Describes a function invocation
 */
export type FunctionInvocationDescription =
  | FreeFunctionInvocationDescription
  | MemberFunctionInvocationDescription

export interface ReturnValueLookupDescription {
  type: 'return-value'
  of: FunctionLookupDescription
}

export interface FunctionLookupDescription {
  type: 'function-declaration'
  identifiedBy: FunctionIdentificationCriteria
}

export interface PositionalArgumentDescription {
  type: 'positional-argument'
  position: number
  of: FunctionInvocationDescription
}

export interface ObjectPathDescription {
  type: 'object-path'
  path: string
  of: SourceLookupDescription
}

export type FunctionIdentificationCriteria = PositionalArgumentDescription

export type SourceLookupDescription =
  | ReturnValueLookupDescription
  | FunctionLookupDescription
  | PositionalArgumentDescription
  | ObjectPathDescription
