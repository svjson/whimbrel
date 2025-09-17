import path from 'node:path'
import fs from 'node:fs/promises'
import { ASSETS_ROOT } from './root'

export const readAsset = async (assetName: string) => {
  return fs.readFile(path.join(ASSETS_ROOT, assetName), 'utf-8')
}
