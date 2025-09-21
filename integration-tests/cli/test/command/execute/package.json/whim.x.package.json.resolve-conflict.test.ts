import { describe, expect, test } from 'vitest'
import path from 'node:path'

import makeTreeFixture from '@whimbrel-test/tree-fixtures'
import { DiskFileSystem } from '@whimbrel/filesystem'
import { whimCli } from 'test/whim-fixture'
import { PackageJSON } from '@whimbrel/package-json'

const { createDirectory } = makeTreeFixture(DiskFileSystem)

describe('whim x package.json:resolve-conflict', () => {
  test('whim x package.json:resolve-conflict', async () => {
    // Given
    const root = await createDirectory(
      [{ 'package.base.json': '@facets/package.json/package.simple.json' }],
      DiskFileSystem
    )
    const oursPath = path.join(root, 'package.ours.json')
    const theirsPath = path.join(root, 'package.theirs.json')

    const basePath = path.join(root, 'package.base.json')

    const ours = await PackageJSON.read(DiskFileSystem, basePath)
    ours.set('version', '2.4.1')
    ours.set('dependencies.@koa/cors', '^5.1.0')
    ours.delete('dependencies.koa-bodyparser')
    await ours.write(oursPath)

    const theirs = await PackageJSON.read(DiskFileSystem, basePath)
    theirs.set('version', '2.4.0')
    theirs.set('dependencies.koa', '^2.16.4')
    theirs.set('devDependencies.ts-node', '^10.10.0')
    await theirs.write(theirsPath)

    const whim = whimCli(root)

    await whim.execute([
      'x',
      'package.json:resolve-conflict',
      '--base',
      'package.base.json',
      '--ours',
      'package.ours.json',
      '--theirs',
      'package.theirs.json',
    ])

    expect(whim.stdout).toMatchSnapshot()
    expect(await DiskFileSystem.readJson(oursPath)).toEqual({
      name: 'simple-things',
      version: '2.4.1',
      author: 'Benny Boxare',
      scripts: {
        build: 'tsc',
        dev: 'nodemon -e ts,js --exec ts-node -r dotenv/config src/index',
        test: 'vitest run',
      },
      dependencies: {
        '@koa/cors': '^5.1.0',
        '@koa/router': '^12.0.1',
        koa: '^2.16.4',
      },
      devDependencies: {
        '@types/koa': '^2.15.0',
        '@types/koa__cors': '^5.0.0',
        '@types/koa__router': '12.0.4',
        '@types/koa-bodyparser': '^4.3.12',
        '@types/node': '^20.11.5',
        'ts-node': '^10.10.0',
        typescript: '^5.6.2',
      },
    })
  })
})
