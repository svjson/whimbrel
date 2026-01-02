import path from 'node:path'
import fs from 'node:fs/promises'
import { ASSETS_ROOT } from './root'

/**
 * Read asset with the relative path `assetName` from the ASSETS_ROOT
 * directory.
 *
 * @param assetName - The relative path of the asset to read.
 *
 * @return The asset contents as a string.
 */
export const readAsset = async (assetName: string) => {
  return fs.readFile(path.join(ASSETS_ROOT, assetName), 'utf-8')
}
