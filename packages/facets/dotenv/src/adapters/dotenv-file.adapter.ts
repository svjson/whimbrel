import path from 'node:path'
import { makeRead, makeReadIfExists, PropertiesFile } from '@whimbrel/struct-file'
import type {
  StructuredFileCtorParams,
  PropertiesFileModel,
  StorageAdapter,
} from '@whimbrel/struct-file'

/**
 * Adapter for .env files, extending the PropertiesFile class from
 * @whimbrel/struct-file.
 *
 * This class is an implementation of StructuredFile specifically designed
 * to handle .env files, which are commonly used for environment
 * configuration in applications.
 *
 * Uses '=' as the key-value separator.
 */
export class DotEnvFile extends PropertiesFile {
  constructor(params: StructuredFileCtorParams<PropertiesFileModel, string>) {
    super({ ...params, kvSeparator: '=' })
  }

  /**
   * Reads a DotEnvFile from disk if it exists.
   *
   * @params storage The StorageAdapter to read from
   * @param filePath The path to the file
   *
   * @returns An instance of DotEnvFile, or null if the file does not exist
   */
  static readIfExists = makeReadIfExists(
    DotEnvFile,
    null,
    async (disk, fPath) => (await disk.read(fPath, 'utf8')) as string
  )

  /**
   * Reads a DotEnvFile from disk.
   *
   * @params storage The StorageAdapter to read fromg
   * @param filePath The path to the file
   *
   * @returns An instance of DotEnvFile
   *
   * @throws If the file does not exist
   */
  static read = makeRead(
    DotEnvFile,
    null,
    async (disk, fPath) => (await disk.read(fPath, 'utf8')) as string
  )

  /**
   * Reads multiple DotEnvFiles from disk.
   *
   * @params storage The StorageAdapter to read from
   * @param root The root directory containing the files
   * @param fileNames The names of the files to read
   *
   * @returns An array of DotEnvFile instances
   * @throws If any of the files do not exist
   */
  static async readAll(
    storage: StorageAdapter,
    root: string,
    fileNames: string[]
  ): Promise<DotEnvFile[]> {
    return Promise.all(
      fileNames.map((envFileName: string) =>
        DotEnvFile.read(storage, [root, envFileName])
      )
    )
  }

  /**
   * Writes the DotEnvFile to disk.
   *
   * Providing a filePath is optional - if omitted, it will be written
   * back to the path it was read from.
   *
   * @param filePath Optional path to write the file to
   *
   * @throws If no path is provided and the file was not read from disk
   */
  async write(filePath?: string | string[]): Promise<void> {
    if (!this.storage) {
      throw new Error('No storage attached to this instance')
    }
    if (Array.isArray(filePath)) {
      filePath = path.join(...filePath)
    }
    return this.storage.write(filePath ?? this.path, this.content.serialize())
  }
}
