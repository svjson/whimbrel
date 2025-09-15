import { makeRead, makeReadIfExists, YamlFile } from '@whimbrel/struct-file'

const FILE_NAME_VARIATIONS = ['docker-compose.yml', 'docker-compose.yaml']

export class DockerComposeYamlAdapter extends YamlFile {
  getServiceNames(): string[] {
    const servicesEntry = this.get('services')
    if (!servicesEntry) return []
    return Object.keys(servicesEntry)
  }

  static readIfExists = makeReadIfExists(
    DockerComposeYamlAdapter,
    FILE_NAME_VARIATIONS,
    async (disk, fPath) => disk.read(fPath, 'utf8') as Promise<string>
  )

  static read = makeRead(
    DockerComposeYamlAdapter,
    FILE_NAME_VARIATIONS,
    async (disk, fPath) => disk.read(fPath, 'utf8') as Promise<string>
  )
}
