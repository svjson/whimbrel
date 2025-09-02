import { describe, expect, it } from 'vitest'

import {
  JSONFile,
  removeInheritedDuplicates,
  SchemaProperty,
  schemaPropertyAtPath,
  StructuredFileSchema,
} from '@src/index'
import { PropertyPath } from '@whimbrel/walk'

const TEST_SCHEMA_WITH_NESTED_OBJECTS = {
  properties: [
    {
      name: 'name',
      type: 'string',
      inherit: true,
    },
    {
      name: 'version',
      type: 'string',
      inherit: true,
    },
    {
      name: 'author',
      type: 'string',
      inherit: false,
    },
    {
      name: 'options',
      type: 'object',
      inherit: true,
      merge: 'deep',
      schema: {
        properties: [
          {
            name: 'module',
            type: 'object',
            inherit: true,
            merge: 'deep',
            schema: {
              properties: [
                {
                  name: 'resolution',
                  type: 'string',
                  inherit: true,
                },
                {
                  name: 'detection',
                  type: 'string',
                  inherit: true,
                },
              ],
            },
          },
        ],
      },
    },
  ],
} satisfies StructuredFileSchema

describe('schemaPropertyAtPath', () => {
  it.each([
    [
      'name',
      {
        schema: TEST_SCHEMA_WITH_NESTED_OBJECTS,
        schemaProp: {
          name: 'name',
          type: 'string',
          inherit: true,
        },
      },
    ],
    [
      ['name'],
      {
        schema: TEST_SCHEMA_WITH_NESTED_OBJECTS,
        schemaProp: {
          name: 'name',
          type: 'string',
          inherit: true,
        },
      },
    ],
    [
      ['options'],
      {
        schema: TEST_SCHEMA_WITH_NESTED_OBJECTS,
        schemaProp: TEST_SCHEMA_WITH_NESTED_OBJECTS.properties[3],
      },
    ],
  ] as [
    PropertyPath,
    {
      schema: StructuredFileSchema
      path: PropertyPath
      schemaProp: SchemaProperty
    },
  ][])('should return root level property %o', (path, { schema, schemaProp }) => {
    expect(schemaPropertyAtPath(schema, path)).toEqual(schemaProp)
  })

  it.each([
    [
      'options.module',
      {
        schema: TEST_SCHEMA_WITH_NESTED_OBJECTS,
        schemaProp: TEST_SCHEMA_WITH_NESTED_OBJECTS.properties[3].schema.properties[0],
      },
    ],
    [
      ['options', 'module'],
      {
        schema: TEST_SCHEMA_WITH_NESTED_OBJECTS,
        schemaProp: TEST_SCHEMA_WITH_NESTED_OBJECTS.properties[3].schema.properties[0],
      },
    ],
    [
      'options.module.resolution',
      {
        schema: TEST_SCHEMA_WITH_NESTED_OBJECTS,
        schemaProp: {
          name: 'resolution',
          type: 'string',
          inherit: true,
        },
      },
    ],
    [
      ['options', 'module', 'resolution'],
      {
        schema: TEST_SCHEMA_WITH_NESTED_OBJECTS,
        schemaProp: {
          name: 'resolution',
          type: 'string',
          inherit: true,
        },
      },
    ],
    [
      'options.module.detection',
      {
        schema: TEST_SCHEMA_WITH_NESTED_OBJECTS,
        schemaProp: {
          name: 'detection',
          type: 'string',
          inherit: true,
        },
      },
    ],
    [
      ['options', 'module', 'detection'],
      {
        schema: TEST_SCHEMA_WITH_NESTED_OBJECTS,
        schemaProp: {
          name: 'detection',
          type: 'string',
          inherit: true,
        },
      },
    ],
  ] as [
    PropertyPath,
    {
      schema: StructuredFileSchema
      path: PropertyPath
      schemaProp: SchemaProperty
    },
  ][])('should return nested property at %o', (path, { schema, schemaProp }) => {
    expect(schemaPropertyAtPath(schema, path)).toEqual(schemaProp)
  })
})

describe('removeInheritedDuplicates', () => {
  it('should remove duplicated string properties if inheritable', () => {
    // Given
    const parent = new JSONFile({
      schema: TEST_SCHEMA_WITH_NESTED_OBJECTS,
      content: {
        name: 'Banana',
        version: '4',
        author: 'Knut',
        options: {
          module: {
            resolution: 'some',
            detection: 'plenty',
          },
        },
      },
    })
    const child = new JSONFile({
      schema: TEST_SCHEMA_WITH_NESTED_OBJECTS,
      content: {
        name: 'Bananarama',
        version: '4',
        author: 'Knut',
        options: {
          module: {
            resolution: 'all of it!',
            detection: 'plenty',
          },
        },
      },
    })

    // When
    removeInheritedDuplicates(parent, child)

    // Then
    expect(child.getContent()).toEqual({
      name: 'Bananarama',
      author: 'Knut',
      options: {
        module: {
          resolution: 'all of it!',
        },
      },
    })
  })
})
