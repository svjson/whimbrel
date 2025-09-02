import equal from 'fast-deep-equal'
import { StructuredFileSchema } from './schema'

export type KeyOrderSpecifier = string | UnknownKeys | readonly [string, KeyOrder]

export type AlphabeticalKeyOrder = readonly ['ALPHA']
export type UnknownKeys = readonly ['*']

export type KeyOrder = KeyOrderSpecifier[] | AlphabeticalKeyOrder

export const ALPHA = ['ALPHA'] as const
export const COLLECT_UNKNOWN = ['*'] as const

export const enforceKeyOrder = (
  object: any,
  keyOrder?: KeyOrder,
  stripUnknown?: boolean
) => {
  if (!keyOrder) return object

  const keys = Object.keys(object)

  if (equal(keyOrder, ALPHA)) {
    keyOrder = keys.sort()
  }

  const handledKeys: string[] = []

  const beforeUnknown: Record<string, any> = {}
  const unknown: Record<string, any> = {}
  const afterUnknown: Record<string, any> = {}

  let target = beforeUnknown

  for (const key of keyOrder) {
    let valueOrder: KeyOrder

    if (equal(key, COLLECT_UNKNOWN)) {
      target = afterUnknown
      continue
    }

    let keyName: string

    if (typeof key === 'string') {
      keyName = key
    } else {
      ;[[keyName, valueOrder]] = Object.entries(key) as [[string, KeyOrder]]
    }

    if (keys.includes(keyName)) {
      target[keyName] = valueOrder
        ? enforceKeyOrder(object[keyName], valueOrder, stripUnknown)
        : object[keyName]
      handledKeys.push(keyName)
    }
  }

  if (!stripUnknown) {
    for (const key of keys) {
      if (!handledKeys.includes(key)) {
        unknown[key] = object[key]
      }
    }
  }

  return {
    ...beforeUnknown,
    ...unknown,
    ...afterUnknown,
  }
}

/**
 * Derive KeyOrder from StructuredFileSchema
 */
export const deriveKeyOrder = (schema: StructuredFileSchema): KeyOrder => {
  return schema.properties.map((p) => {
    if (p.type === 'object') {
      return [p.name, deriveKeyOrder(p.schema)]
    }
    return p.name
  })
}
