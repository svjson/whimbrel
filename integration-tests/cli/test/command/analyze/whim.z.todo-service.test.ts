import { describe, expect, beforeAll, test } from 'vitest'
import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'
import { whimCli } from 'test/whim-fixture'

const { prepareGitRepository } = makeTreeFixture(DiskFileSystem)

describe('whim z <todo-service>', () => {
  let root: string

  beforeAll(async () => {
    root = await prepareGitRepository(DiskFileSystem, 'todo-service')
  })

  test('whim z', async () => {
    const whim = whimCli(root)

    await whim.execute('z')

    expect(whim.stdout).toMatchSnapshot()
    expect(whim.stdout).toContain('Define Source')
    expect(whim.stdout).toContain('Analyze Actor')
    expect(whim.stdout).toContain('Discover Actor Facets')
    expect(whim.stdout).toContain('Reify Actor')
  })

  test('whim z --no-color', async () => {
    const whim = whimCli(root)

    await whim.execute(['z', '--no-color'])

    expect(whim.stdout).toMatchSnapshot()
    expect(whim.stdout).toContain('Define Source')
    expect(whim.stdout).toContain('Analyze Actor')
    expect(whim.stdout).toContain('Discover Actor Facets')
    expect(whim.stdout).toContain('Reify Actor')
  })
})
