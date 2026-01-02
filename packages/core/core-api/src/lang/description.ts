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

/**
 * Describes the source from which an entity/identifier is imported.
 */
export type ImportSourceDescription = {
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

/**
 * Describes a function invocation
 */
export type FunctionInvocationDescription = {
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
