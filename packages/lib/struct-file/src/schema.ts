import { PropertyPath, walk } from '@whimbrel/walk'
import { StructuredFile } from './structured-file'
import equal from 'fast-deep-equal'

export type PropertyType = 'string' | 'string[]' | 'object' | 'boolean' | 'number'

export type MergeStrategy = 'deep' | 'shallow' | 'copy' | 'custom'

export interface BaseSchemaProperty {
  name: string
  inherit: boolean | 'custom'
  required?: boolean | 'custom'
}

export interface ValueSchemaProperty extends BaseSchemaProperty {
  type: 'string' | 'boolean' | 'number'
}

export interface StringArraySchemaProperty extends BaseSchemaProperty {
  type: 'string[]'
}

export interface ObjectSchemaProperty extends BaseSchemaProperty {
  type: 'object'
  merge: MergeStrategy
  schema: StructuredFileSchema
}

export type SchemaProperty =
  | ValueSchemaProperty
  | StringArraySchemaProperty
  | ObjectSchemaProperty

export type StructuredFileSchema = {
  inheritUnknownProperties?: boolean
  allowArbitraryProperties?: boolean
  properties: SchemaProperty[]
}

/**
 * Return the SchemaProperty at the path described by `property`, if it exists.
 *
 * @param schema The schema to search
 * @param property The property path to search for
 */
export const schemaPropertyAtPath = (
  schema: StructuredFileSchema,
  property: PropertyPath
): SchemaProperty | undefined => {
  const [next, ...rest] = Array.isArray(property) ? property : property.split('.')
  const nextProp = schema.properties.find((p) => p.name === next)

  if (!nextProp) return undefined
  if (rest.length === 0) return nextProp
  if (nextProp.type === 'object') {
    return schemaPropertyAtPath(nextProp.schema, rest)
  }
  return undefined
}

export const removeInheritedDuplicates = (
  parent: StructuredFile,
  child: StructuredFile
) => {
  const schema = parent.getSchema()
  walk(child.getContent(), {
    onEach: ({ path, value }) => {
      const propSchema = schemaPropertyAtPath(schema, path)
      if (propSchema) {
        if (propSchema.inherit === false) return
      }
      if (equal(parent.get(path), value)) {
        child.delete(path)
      }
    },
  })
}
