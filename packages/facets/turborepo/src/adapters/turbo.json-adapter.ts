import { JSONFile, makeRead, makeReadIfExists } from '@whimbrel/struct-file'

export class TurboJSON extends JSONFile {
  static readIfExists = makeReadIfExists(TurboJSON, 'turbo.json', async (disk, fPath) =>
    disk.read(fPath, 'utf8')
  )

  static read = makeRead(TurboJSON, 'turbo.json', async (disk, fPath) =>
    disk.read(fPath, 'utf8')
  )
}
