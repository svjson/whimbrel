import {
  ALPHA,
  COLLECT_UNKNOWN,
  JSONFile,
  KeyOrder,
  makeReadIfExists,
  makeRead,
} from '@whimbrel/struct-file'
import { isVersion, updateVersionString } from '@src/lib'

const PACKAGE_JSON_KEY_ORDER: KeyOrder = [
  'name',
  'version',
  'type',
  'private',
  'description',
  'license',
  'homepage',
  'repository',
  'bugs',
  'author',
  'contributors',
  'packageManager',
  'engines',
  'workspaces',
  'main',
  'module',
  'types',
  'files',
  'bin',
  COLLECT_UNKNOWN,
  ['scripts', ALPHA],
  ['peerDependencies', ALPHA],
  ['dependencies', ALPHA],
  ['devDependencies', ALPHA],
] as const

export class PackageJSON extends JSONFile {
  constructor(...args: ConstructorParameters<typeof JSONFile>) {
    super({ ...args[0], keyOrder: PACKAGE_JSON_KEY_ORDER })
  }

  isDeclaredEngine(name: string) {
    return Boolean(this.get(['engines', name]))
  }

  getPackageManager() {
    const val = this.get<string>('packageManager')
    if (val) {
      const [name, version] = val.split('@')
      return { name, version }
    }
  }

  isDeclaredPackageManager(mgrName: string) {
    const pkgManager = this.getPackageManager()
    if (pkgManager) {
      return pkgManager?.name === mgrName
    }
    return this.isDeclaredEngine(mgrName)
  }

  getDependencyVersion(dependency: string, opts: { exact?: boolean } = {}) {
    const version = [
      this.get(['dependencies', dependency]),
      this.get(['devDependencies', dependency]),
      this.get(['peerDependencies', dependency]),
    ]
      .filter(Boolean)
      .sort()[0]

    if (typeof version === 'string' && opts.exact) {
      if (version.startsWith('^')) {
        return version.slice(1)
      }
    }

    return version
  }

  hasDependency(dependency: string) {
    return (
      Object.keys(this.get('dependencies', {})).includes(dependency) ||
      Object.keys(this.get('devDependencies', {})).includes(dependency) ||
      Object.keys(this.get('peerDependencies', {})).includes(dependency)
    )
  }

  updateDependency(dependency: string, version: string): boolean {
    let updated = false
    ;['dependencies', 'devDependencies', 'peerDependencies'].forEach((depColl) => {
      const currentVersion: string = this.get([depColl, dependency])
      if (currentVersion && !isVersion(currentVersion, version)) {
        const updatedVersion = updateVersionString(currentVersion, version)
        this.set([depColl, dependency], updatedVersion)
        updated = true
      }
    })

    return updated
  }

  setDependencyVersion(
    dependency: string,
    version: string,
    force: boolean = false
  ): boolean {
    let set = false
    ;['dependencies', 'devDependencies', 'peerDependencies'].forEach((depColl) => {
      const currentVersion: string = this.get([depColl, dependency])
      if (currentVersion || force) {
        this.set([depColl, dependency], version)
        set = true
      }
    })

    return set
  }

  static readIfExists = makeReadIfExists(
    PackageJSON,
    'package.json',
    async (disk, fPath) => disk.read(fPath, 'utf8')
  )

  static read = makeRead(PackageJSON, 'package.json', async (disk, fPath) =>
    disk.read(fPath, 'utf8')
  )
}
