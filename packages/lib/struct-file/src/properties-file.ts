import path from 'node:path'
import { PropertyPath } from '@whimbrel/walk'
import {
  makeRead,
  makeReadIfExists,
  StructOptions,
  StructuredFile,
  StructuredFileCtorParams,
} from './structured-file'

/**
 * PropertiesFile-specific options
 */
interface PropertiesFileOpts {
  /**
   * The key/value separator used in the properties file, ie '='
   */
  kvSeparator: string
}

/**
 * Base interface for entries in a properties file.
 */
interface BaseEntry {
  comment?: string
}

/**
 * Interface for key/value entries in a properties file.
 */
interface KeyValueEntry extends BaseEntry {
  key: string
  value: string
}

/**
 * Interface for empty lines in a properties file.
 */
type EmptyLine = BaseEntry

/**
 * Union type for all possible entries in a properties file.
 */
type PropertyFileEntry = KeyValueEntry | EmptyLine | BaseEntry

/**
 * In-memory model for flat key/value properties files.
 */
export class PropertiesFileModel {
  /**
   * Map of property keys to their corresponding entries for quick
   * lookup.
   */
  props: Record<string, KeyValueEntry>

  /**
   * Creates an instance of PropertiesFileModel from a PropertyFileEntry
   * array and StructuredFile-options and PropertiesFile-specific options
   * in `opts`.
   *
   * To create an instance from a file buffer string, use the static
   * `parse` method.
   *
   * @param entries The array of PropertyFileEntry objects
   * @param opts The PropertiesFile-specific options
   *
   * @returns An instance of PropertiesFileModel
   */
  constructor(
    private entries: PropertyFileEntry[],
    public opts: PropertiesFileOpts
  ) {
    this.props = entries.reduce(
      (props, entry) => {
        if ('key' in entry) {
          props[entry.key] = entry
        }
        return props
      },
      {} as Record<string, KeyValueEntry>
    )
  }

  /**
   * Gets the value for a given key.
   *
   * @param key The property key
   * @returns The property value, or undefined if the key does not exist
   */
  get(key: string): string | undefined {
    return this.props[key]?.value
  }

  /**
   * Sets the value for a given key. If the key does not exist, it will be
   * created.
   *
   * @param key The property key
   * @param value The property value
   */
  set(key: string, value: string): void {
    const entry = this.#getOrCreateEntry(key)
    entry.value = value
  }

  /**
   * Get all property names present in the model
   *
   * @returns An array of property names
   */
  propertyNames(): string[] {
    return Object.keys(this.props)
  }

  /**
   * Internal utility method to get or create an entry for a given key.
   *
   * @param key The property key
   * @returns The existing or newly created KeyValueEntry
   *
   * @internal
   */
  #getOrCreateEntry(key: string) {
    if (Object.hasOwn(this.props, key)) {
      return this.props[key]
    }

    const entry = {
      key,
      value: '',
    }

    this.props[key] = entry
    this.entries.push(entry)
    return entry
  }

  /**
   * Parses a properties file from a string source.
   *
   * @param source The properties file content as a string
   * @param opts The PropertiesFile-specific options
   */
  static parse(
    source: string,
    opts: PropertiesFileOpts = { kvSeparator: '=' }
  ): PropertiesFileModel {
    const lines = source.split('\n')
    const entries = []
    for (const line of lines) {
      const [key, ...rest] = line.split(opts.kvSeparator)
      if (!key) {
        entries.push({})
        continue
      }
      let value = rest.join(opts.kvSeparator)
      entries.push({
        key,
        value,
      })
    }

    return new PropertiesFileModel(entries, opts)
  }

  /**
   * Serializes the PropertiesFileModel back to a string.
   *
   * @returns The serialized properties file content as a string
   */
  serialize(): string {
    const lines = this.entries.map((entry) => {
      if ('key' in entry) {
        return [entry.key, this.opts.kvSeparator, entry.value].join('')
      }

      return ''
    })

    return lines.join('\n')
  }
}

/**
 * Specialied StructuredFileCtorParams-type for PropertiesFile.
 */
export interface PropertiesFileCtorParams
  extends StructuredFileCtorParams<PropertiesFileModel, string> {
  kvSeparator: string
}

/**
 * Adapter flat key/value properties files.
 *
 * This StructuredFile-implementation is meant to either work as is for any
 * properties file format that uses a simple one key/value pair per line.
 *
 * It otherwise follows the same semantics as any other StructuredFile.
 *
 * The delimiter can specified, but defaults to '='.
 *
 * Examples of such formats are Java .properties files, .env files, and INI
 * files (without sections).
 */
export class PropertiesFile extends StructuredFile<PropertiesFileModel, string> {
  /**
   * The key/value separator used in the properties file.
   */
  kvSeparator: string

  /**
   * Creates a new PropertiesFile instance.
   *
   * @param params The constructor parameters
   * @param params.kvSeparator The key/value separator (default: '=')
   * @param params.path The file path
   * @param params.storage The storage adapter
   * @param params.content The file content
   * @throws If deserialization of the content fails
   */
  constructor(params: PropertiesFileCtorParams) {
    super(params)
    this.kvSeparator = params.kvSeparator ?? '='
    if (this.content === undefined) {
      this.content = new PropertiesFileModel([], { kvSeparator: this.kvSeparator })
    }
  }

  /**
   * Deserialize the file content from its on-disk representation.
   *
   * @param content The on-disk representation of the file's content
   *
   * @returns The in-memory representation of the file's content
   */
  deserializeContent(content: string | PropertiesFileModel): PropertiesFileModel {
    if (content instanceof PropertiesFileModel) {
      return content
    }
    if (typeof content === 'string') {
      return PropertiesFileModel.parse(content)
    }
  }

  /**
   * Checks if the property contains all specified values.
   *
   * @param property The property path
   * @param values The values to check for
   *
   * @returns True if the property contains all values, false otherwise
   */
  containsAll(property: PropertyPath, values: any[]): boolean {
    throw new Error('Method not implemented.')
  }

  /**
   * Gets the value of a property.
   *
   * @param property The property path
   * @param defaultValue The default value to return if the property does not exist
   *
   * @returns The property value, or the default value if the property does not exist
   *
   * @template T The expected return type
   *
   * @see StructuredFile.get
   */
  get<T = any>(property: PropertyPath, defaultValue?: T): T {
    return this.content.get(
      typeof property === 'string' ? property : property.join('.')
    ) as T
  }

  /**
   * Sets the value of a property.
   *
   * @see StructuredFile.set
   */
  set(property: PropertyPath, value: any): void {
    this.content.set(
      typeof property === 'string' ? property : property.join('.'),
      String(value)
    )
  }

  /**
   * Get all property names present in the files
   *
   * @returns An array of property names
   */
  propertyNames(): string[] {
    return this.content.propertyNames()
  }

  /**
   * Deletes a property.
   *
   * @see StructuredFile.delete
   */
  delete(property: PropertyPath): void {
    throw new Error('Method not implemented.')
  }

  /**
   * Enforces the structure of the file according to the provided options.
   */
  enforceStructure(opts?: StructOptions): void {
    throw new Error('Method not implemented.')
  }

  /**
   * Reads a PropertiesFile from disk if it exists.
   *
   * @params storage The StorageAdapter to read from
   * @param filePath The path to the file
   *
   * @returns An instance of PropertiesFile, or null if the file does not exist
   */
  static readIfExists = makeReadIfExists(
    PropertiesFile,
    null,
    async (disk, fPath) => (await disk.read(fPath, 'utf8')) as string
  )

  /**
   * Reads a PropertiesFile from disk.
   *
   * @params storage The StorageAdapter to read fromg
   * @param filePath The path to the file
   *
   * @returns An instance of PropertiesFile
   *
   * @throws If the file does not exist
   */
  static read = makeRead(
    PropertiesFile,
    null,
    async (disk, fPath) => (await disk.read(fPath, 'utf8')) as string
  )

  /**
   * Writes the PropertiesFile to disk.
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
