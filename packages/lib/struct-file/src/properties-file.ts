import path from 'node:path'
import { PropertyPath } from '@whimbrel/walk'
import {
  makeRead,
  makeReadIfExists,
  StructOptions,
  StructuredFile,
  StructuredFileCtorParams,
} from './structured-file'

interface PropertiesFileOpts {
  kvSeparator: string
}

interface BaseEntry {
  comment?: string
}

interface KeyValueEntry extends BaseEntry {
  key: string
  value: string
}

type EmptyLine = BaseEntry

type PropertyFileEntry = KeyValueEntry | EmptyLine | BaseEntry

export class PropertiesFileModel {
  props: Record<string, KeyValueEntry>

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

  get(key: string) {
    return this.props[key]?.value
  }

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

  set(key: string, value: string) {
    const entry = this.#getOrCreateEntry(key)
    entry.value = value
  }

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

export class PropertiesFile extends StructuredFile<PropertiesFileModel, string> {
  constructor(params: StructuredFileCtorParams<PropertiesFileModel, string>) {
    super(params)
    if (this.content === undefined) {
      this.content = new PropertiesFileModel([], { kvSeparator: '=' })
    }
  }

  deserializeContent(content: string | PropertiesFileModel): PropertiesFileModel {
    if (content instanceof PropertiesFileModel) {
      return content
    }
    if (typeof content === 'string') {
      return PropertiesFileModel.parse(content)
    }
  }
  containsAll(property: PropertyPath, values: any[]): boolean {
    throw new Error('Method not implemented.')
  }
  get<T = any>(property: PropertyPath, defaultValue?: T): T {
    return this.content.get(
      typeof property === 'string' ? property : property.join('.')
    ) as T
  }
  set(property: PropertyPath, value: any): void {
    this.content.set(
      typeof property === 'string' ? property : property.join('.'),
      String(value)
    )
  }
  delete(property: PropertyPath): void {
    throw new Error('Method not implemented.')
  }
  enforceStructure(opts?: StructOptions): void {
    throw new Error('Method not implemented.')
  }

  static readIfExists = makeReadIfExists(
    PropertiesFile,
    null,
    async (disk, fPath) => (await disk.read(fPath, 'utf8')) as string
  )

  static read = makeRead(
    PropertiesFile,
    null,
    async (disk, fPath) => (await disk.read(fPath, 'utf8')) as string
  )

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
