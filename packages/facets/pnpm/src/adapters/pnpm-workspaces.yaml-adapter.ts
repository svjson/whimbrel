import { makeRead, makeReadIfExists, YamlFile } from '@whimbrel/struct-file'

const FILE_NAME = 'pnpm-workspaces.yaml'

export class PnpmWorkspacesYaml extends YamlFile {
  getWorkspacePaths() {
    return this.get('packages')
  }

  static readIfExists = makeReadIfExists(
    PnpmWorkspacesYaml,
    FILE_NAME,
    async (disk, fPath) => disk.read(fPath, 'utf8') as Promise<string>
  )

  static read = makeRead(
    PnpmWorkspacesYaml,
    FILE_NAME,
    async (disk, fPath) => disk.read(fPath, 'utf8') as Promise<string>
  )
}
