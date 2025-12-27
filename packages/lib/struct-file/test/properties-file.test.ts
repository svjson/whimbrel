import { describe, expect, it } from 'vitest'
import { memFsContext } from '@whimbrel-test/context-fixtures'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { PropertiesFile } from '@src/index'
import { PropertiesFileModel } from 'src/properties-file'
import { DiskFileSystem } from '@whimbrel/filesystem'
import path from 'node:path'

const { createDirectory } = makeTreeFixture(DiskFileSystem)

const TWO_EQ_DUMMY_PROPERTIES = `
my.property=ostmuffin
another_prop=here lives dog
`

describe('PropertiesFileModel', () => {
  describe('all kv lines', () => {
    it('should parse input of =-separated keys and values', () => {
      // When
      const model = PropertiesFileModel.parse(TWO_EQ_DUMMY_PROPERTIES)

      // Then
      expect(model.get('my.property')).toEqual('ostmuffin')
      expect(model.get('another_prop')).toEqual('here lives dog')
    })

    it('should serialize model back to identical text content', () => {
      // Given
      const model = PropertiesFileModel.parse(TWO_EQ_DUMMY_PROPERTIES)

      // When
      const serialized = model.serialize()

      // Then
      expect(serialized).toEqual(TWO_EQ_DUMMY_PROPERTIES)
    })
  })
})

describe('PropertiesFile', () => {
  describe('read', () => {
    it('should read named file', async () => {
      // Given
      const ctx = await memFsContext()
      const root = await createDirectory(
        [
          {
            'test.properties': TWO_EQ_DUMMY_PROPERTIES,
          },
        ],
        ctx.disk
      )

      // When
      const propFile = await PropertiesFile.read(ctx.disk, [root, 'test.properties'])

      // Then
      expect(propFile.get('my.property')).toEqual('ostmuffin')
      expect(propFile.get('another_prop')).toEqual('here lives dog')
    })
  })

  describe('write', () => {
    it('should write file back to source', async () => {
      // Given
      const ctx = await memFsContext()
      const root = await createDirectory(
        [
          {
            'test.properties': TWO_EQ_DUMMY_PROPERTIES,
          },
        ],
        ctx.disk
      )
      const propFile = await PropertiesFile.read(ctx.disk, [root, 'test.properties'])

      // When
      propFile.set('third.property', 'gets a value')
      await propFile.write()

      // Then
      expect(await ctx.disk.read(path.join(root, 'test.properties'), 'utf8')).toEqual(`
my.property=ostmuffin
another_prop=here lives dog

third.property=gets a value`)
    })
  })
})
