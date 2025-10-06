import { WhimbrelContext } from '@whimbrel/core-api'
import { PackageJSON } from '@whimbrel/package-json'

const pnpmVersionFromPackageJSON = async (ctx: WhimbrelContext, cwd: string) => {
  const pkgJson = await PackageJSON.readIfExists(ctx.disk, cwd)
  if (!pkgJson) return

  const packageManager = pkgJson.getPackageManager()
  if (packageManager?.name === 'pnpm') {
    return packageManager.version
  }

  return pkgJson.getDependencyVersion('pnpm', { exact: true })
}

const pnpmVersionFromPnpmCommand = async (ctx: WhimbrelContext, cwd: string) => {
  try {
    const [stdout] = await ctx.runCommand(cwd, ['pnpm', '--version'])
    const [pnpmVersion] = stdout.split('\n')
    return pnpmVersion
  } catch {
    return undefined
  }
}

const pnpmVersionFromNpm = async (ctx: WhimbrelContext, cwd: string) => {
  try {
    const [stdout] = await ctx.runCommand(cwd, ['npm', 'view', 'pnpm', 'version'])
    const [pnpmVersion] = stdout.split('\n')
    return pnpmVersion
  } catch {
    return undefined
  }
}

export const getPnpmVersion = async (ctx: WhimbrelContext, cwd: string) => {
  for (const strategy of [
    pnpmVersionFromPackageJSON,
    pnpmVersionFromPnpmCommand,
    pnpmVersionFromNpm,
  ]) {
    const version = await strategy(ctx, cwd)
    if (version) return version
  }
}
