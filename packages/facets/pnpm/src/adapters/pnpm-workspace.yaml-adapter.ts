import { makeRead, makeReadIfExists, YamlFile } from '@whimbrel/struct-file'

const FILE_NAME = 'pnpm-workspace.yaml'

export class PnpmWorkspaceYaml extends YamlFile {
  getWorkspacePaths() {
    return this.get('packages')
  }

  static readIfExists = makeReadIfExists(
    PnpmWorkspaceYaml,
    FILE_NAME,
    async (disk, fPath) => disk.read(fPath, 'utf8') as Promise<string>
  )

  static read = makeRead(
    PnpmWorkspaceYaml,
    FILE_NAME,
    async (disk, fPath) => disk.read(fPath, 'utf8') as Promise<string>
  )
}
