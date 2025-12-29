import path from 'node:path'
import { describe, expect, test } from 'vitest'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { whimCli } from 'test/whim-fixture'
import { DiskFileSystem } from '@whimbrel/filesystem'

const { createDirectory } = makeTreeFixture(DiskFileSystem)

describe('whim x dotenv:update-templates', () => {
  test('no op when property keys are identical between .env and .env.template', async () => {
    // Given
    const root = await createDirectory([
      { '.env': '@facets/dotenv/simple-http-service.env' },
      { '.env.template': '@facets/dotenv/simple-http-service.env' },
    ])
    const dotEnvPath = path.join(root, '.env')
    const dotEnvTemplatePath = path.join(root, '.env.template')

    const originalEnv = await DiskFileSystem.read(dotEnvPath, 'utf8')
    const originalEnvTemplate = await DiskFileSystem.read(dotEnvTemplatePath, 'utf8')

    const whim = whimCli(root)

    // When
    await whim.execute(['x', 'dotenv:update-templates'])

    // Then
    expect(await DiskFileSystem.read(dotEnvPath, 'utf8')).toEqual(originalEnv)
    expect(await DiskFileSystem.read(dotEnvTemplatePath, 'utf8')).toEqual(
      originalEnvTemplate
    )
  })
})
