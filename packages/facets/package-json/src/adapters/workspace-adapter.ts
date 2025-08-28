import { Actor, ActorId, WhimbrelContext } from '@whimbrel/core-api'
import { PackageJSON } from './package.json-adapter'

export class WorkspaceAdapter {
  constructor(
    private ctx: WhimbrelContext,
    private actor: Actor,
    private pkgJson: PackageJSON
  ) {}

  async getSubModulePackageJSON(subModule: ActorId) {
    const subActor = this.ctx.getActor(subModule)
    if (subActor) return await PackageJSON.readIfExists(this.ctx.disk, subActor.root)
  }

  async getSubModulesPackageJSON(): Promise<PackageJSON[]> {
    const subPackageJSONs: PackageJSON[] = []
    for (const subModule of this.actor.subModules) {
      const subPkgJson = await this.getSubModulePackageJSON(subModule)
      if (subPkgJson) {
        subPackageJSONs.push(subPkgJson)
      }
    }
    return subPackageJSONs
  }

  async forEachModule(fn: (pkgJson: PackageJSON) => Promise<void>): Promise<void> {
    const subJsons = await this.getSubModulesPackageJSON()
    for (const pkgJson of subJsons) {
      await fn(pkgJson)
    }
  }

  getInternalDependencies(dependencyCollection: Record<string, string> | undefined) {
    return Object.entries(dependencyCollection ?? {}).reduce(
      (internalDeps, [name, version]) => {
        const depActor = this.ctx.getActor({ name }, 'source')
        if (depActor && this.actor.subModules.includes(depActor.id)) {
          internalDeps[name] = version
        }
        return internalDeps
      },
      {} as Record<string, string>
    )
  }

  async validatePeerDependencies() {
    for (const subModule in this.actor.subModules) {
      const subPkgJson = await this.getSubModulePackageJSON(subModule)

      const deps = this.getInternalDependencies(subPkgJson.get('dependencies'))
      const devDeps = this.getInternalDependencies(subPkgJson.get('devDependencies'))
      const peerDeps = this.getInternalDependencies(subPkgJson.get('peerDependencies'))
    }
  }
}
