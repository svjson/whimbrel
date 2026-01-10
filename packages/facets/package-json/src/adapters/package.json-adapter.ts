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

/**
 * Specialization of the JSONFile adapter that provides package.json-specific
 * functions for analyzing and modifying the package.json format.
 */
export class PackageJSON extends JSONFile {
  /**
   * Constructs a new PackageJSON instance using the PACKAGE_JSON_KEY_ORDER
   * default constant for schema and formatting.
   */
  constructor(...args: ConstructorParameters<typeof JSONFile>) {
    super({ ...args[0], keyOrder: PACKAGE_JSON_KEY_ORDER })
  }

  /**
   * Query if the engine with `name` is currently declared as the engine
   * of this package.
   *
   * @param name - The name of the engine to check for.
   *
   * @return True if the engine is declared, false otherwise.
   */
  isDeclaredEngine(name: string) {
    return Boolean(this.get(['engines', name]))
  }

  /**
   * Get the currently declared package manager of this package.
   *
   * The return value is in the format of { name: string, version: string }.
   *
   * @return The package manager name and version, or undefined if not
   *         declared.
   */
  getPackageManager() {
    const val = this.get<string>('packageManager')
    if (val) {
      const [name, version] = val.split('@')
      return { name, version }
    }
  }

  /**
   * Query if `mgrName` is currently declared as the package manager of
   * this package.
   *
   * @param mgrName - The name of the package manager to check for.
   *
   * @return True if the package manager is declared, false otherwise.
   */
  isDeclaredPackageManager(mgrName: string) {
    const pkgManager = this.getPackageManager()
    if (pkgManager) {
      return pkgManager?.name === mgrName
    }
    return this.isDeclaredEngine(mgrName)
  }

  /**
   * Get the names of all declared scripts in this package.
   *
   * @return An array of script names.
   */
  getScriptNames(): string[] {
    return Object.keys(this.get('scripts', {}))
  }

  /**
   * Get the command string for a declared script.
   *
   * @param scriptName - The name of the script to get.
   *
   * @return The script command string, or undefined if not declared.
   */
  getScript(scriptName: string): string | undefined {
    return this.get<string>(['scripts', scriptName])
  }

  /**
   * Create or update script.
   *
   * @param scriptName - The name of the script to define
   * @param commandString - The script content
   */
  setScript(scriptName: string, commandString: string): void {
    this.set(['scripts', scriptName], commandString)
  }

  /**
   * Delete a declared script from the "scripts" section
   *
   * @param scriptName - The name of the script to delete
   */
  deleteScript(scriptName: string): void {
    return this.delete(['scripts', scriptName])
  }

  /**
   * Get the declared version string for a dependency.
   *
   * @param dependency - The name of the dependency to get the version for.
   * @param opts - Options for retrieving the version.
   * @param opts.exact - If true, returns the exact version without
   *                     any semver range specifiers (e.g., '^').
   */
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

  /**
   * Query if the package has a dependency with the given name.
   *
   * @param dependency - The name of the dependency to check for.
   *
   * @return True if the dependency is declared, false otherwise.
   */
  hasDependency(dependency: string) {
    return (
      Object.keys(this.get('dependencies', {})).includes(dependency) ||
      Object.keys(this.get('devDependencies', {})).includes(dependency) ||
      Object.keys(this.get('peerDependencies', {})).includes(dependency)
    )
  }

  /**
   * Update the version string for a dependency if the current version
   *
   * @param dependency - The name of the dependency to update.
   * @param version - The new version to set.
   *
   * @return True if the dependency was updated, false otherwise.
   */
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

  /**
   * Set the version string for a dependency, optionally forcing the set
   *
   * @param dependency - The name of the dependency to set.
   * @param version - The new version to set.
   *
   * @return True if the dependency was set, false otherwise.
   */
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

  /**
   * Read and parse a package.json file if it exists at the given path.
   *
   * @param storage - The disk storage adapter to use.
   * @param filePath - The path to the package.json file.
   *
   * @return The PackageJSON instance, or undefined if the file does not exist.
   */
  static readIfExists = makeReadIfExists(
    PackageJSON,
    'package.json',
    async (disk, fPath) => disk.read(fPath, 'utf8')
  )

  /**
   * Read and parse a package.json file at the given path.
   *
   * @param storage - The disk storage adapter to use.
   * @param filePath - The path to the package.json file.
   *
   * @return The PackageJSON instance.
   *
   * @throws If the file does not exist or is not readable.
   */
  static read = makeRead(PackageJSON, 'package.json', async (disk, fPath) =>
    disk.read(fPath, 'utf8')
  )
}
