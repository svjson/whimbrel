import fs from 'node:fs/promises'
import path from 'node:path'

import { FileSystem } from '@whimbrel/core-api'
import { CreateDirectoryFixture } from './create'
import { unpackGitRepository } from '@whimbrel-test/asset-fixtures'

export const makeGitRepoFixture = (
  ensureFs: (fs?: FileSystem) => FileSystem,
  createFixture: CreateDirectoryFixture
) => {
  const scanDirectory = async (dir: string) => {
    const results = []

    async function walk(current: string) {
      const entries = await fs.readdir(current, { withFileTypes: true })

      for (const entry of entries) {
        const entryPath = path.join(current, entry.name)

        if (entry.isDirectory()) {
          results.push({ type: 'directory', path: entryPath })
          await walk(entryPath)
        } else if (entry.isFile()) {
          results.push({ type: 'file', path: entryPath })
        }
      }
    }

    await walk(dir)
    return results
  }

  const importToMemFs = async (disk: FileSystem, path: string) => {
    const importEntries = await scanDirectory(path)

    const opts = { silent: true, report: false }
    for (const entry of importEntries) {
      switch (entry.type) {
        case 'file':
          await disk.writeReference(entry.path, entry.path, opts)
          break
        case 'directory':
          if (!(await disk.exists(entry.path))) {
            await disk.mkdir(entry.path, opts)
          }
          break
      }
    }
  }

  const prepareGitRepository = async (disk: FileSystem, repoName: string) => {
    disk = ensureFs(disk)

    const physicalRoot = await createFixture.createEmptyDir('whim-repo', ensureFs())
    await unpackGitRepository(repoName, physicalRoot)

    if (!disk.isPhysical()) {
      await importToMemFs(disk, physicalRoot)
    }

    return physicalRoot
  }

  return {
    prepareGitRepository,
  }
}
