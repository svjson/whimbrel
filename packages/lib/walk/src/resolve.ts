import path from 'node:path'
import { readPath } from './path'

export type ParameterType = 'object' | 'string' | 'path' | 'relative-path'

export type Properties = Record<string, string>

export interface PropertyOwner {
  options: {
    prop: Properties
  }
}

export type PropertyLookup = {
  lookup(prop: string): any
  source(): any
}

export type PropertySource = Properties | PropertyOwner | PropertyLookup

export interface BaseResolution {
  value?: any
}

export interface ReferenceResolution extends BaseResolution {
  method: 'reference'
  reference: string
}

export interface LiteralResolution extends BaseResolution {
  method: 'literal'
}

export interface PlaceholderResolution extends BaseResolution {
  method: 'placeholder'
  placeholder: string
}

export interface ConcatResolution extends BaseResolution {
  method: 'path-concatenation'
  parts: string[]
  resolutions: Resolution[]
}

export type Resolution =
  | LiteralResolution
  | ReferenceResolution
  | PlaceholderResolution
  | ConcatResolution

const toPropertyLookup = (source: PropertySource): PropertyLookup => {
  if (Object.hasOwn(source, 'lookup') && Object.hasOwn(source, 'source'))
    return source as PropertyLookup

  const optProps = (source as any)?.options?.prop
  if (optProps && typeof optProps === 'object') {
    return {
      lookup(prop: string) {
        if (Object.hasOwn(optProps, prop)) {
          return optProps[prop]
        }

        return readPath(source, prop)
      },

      source() {
        return source
      },
    }
  }

  return {
    lookup(prop: string) {
      return source?.[prop]
    },
    source() {
      return source
    },
  }
}

/**
 * Return the value of a "<<placeholder>>", if present.
 */
export const resolvePlaceholderValue = (
  source: PropertySource,
  placeholder: string
): string | undefined => {
  const props = toPropertyLookup(source)
  return props.lookup(placeholder)
}

/**
 * Function for consistently extracting values of different types,
 * and resolving encountered placeholders.
 */
export const resolve = (
  type: ParameterType,
  propertySource: PropertySource,
  source: any,
  resolutionPaths?: string[] | string
) => {
  return resolveWithMetadata(type, propertySource, source, resolutionPaths)?.value
}

/**
 * Consistenly resolve values of different types from a property source,
 * and return resolved value along with resolution metadata
 */
export const resolveWithMetadata = (
  type: ParameterType,
  propertySource: PropertySource,
  source: any,
  resolutionPaths?: string[] | string
): Resolution => {
  const props = toPropertyLookup(propertySource)

  if (typeof resolutionPaths === 'string') {
    resolutionPaths = [resolutionPaths]
  }

  const resolved = resolutionPaths
    ? resolutionPaths.map((objPath) => walkObj(source, objPath)).filter(Boolean)
    : [source]

  for (const candidate of resolved) {
    switch (type) {
      case 'object':
        return verifyObject(source, props, candidate)
      case 'string':
        return verifyString(props, candidate)
      case 'path':
      case 'relative-path':
        return verifyPath(source, props, candidate, type)
    }
  }
}

/**
 * Resolve a placeholder in the format of <<placeholder>>.
 */
const resolvePlaceholder = (props: PropertyLookup, string: string) => {
  const match = string.match(/^<<([\s\S]+)>>$/)

  if (!match) {
    return string
  }

  const placeholder = match[1]

  const resolved = resolvePlaceholderValue(props, placeholder)
  if (resolved === null || resolved === undefined) {
    throw new Error(`Unable to resolve placeholder: '${string}'`)
  }

  return resolved
}

/**
 * Walk an object using a dot-separated path.
 * This function allows for nested property access and
 * returns the value at the specified path.
 *
 * FIXME: Should this perhaps use the regular walk/readPath ?
 */
export const walkObj = (obj: any, path: string) => {
  const parts = path.split('.')
  const part = parts.shift()
  const next = obj?.[part]

  if (parts.length > 0 && next !== null && next !== undefined) {
    return walkObj(next, parts.join('.'))
  }
  return next
}

/**
 * Verify that the value is a string and resolve any placeholders.
 */
const verifyString = (props: PropertyLookup, value: string): Resolution => {
  if (typeof value === 'string') {
    const resolved = resolvePlaceholder(props, value)

    if (resolved === value) {
      return {
        method: 'literal',
        value: resolved,
      }
    } else {
      return {
        method: 'placeholder',
        placeholder: value,
        value: resolved,
      }
    }
  }

  throw new Error('Got non-string: ', value)
}

/**
 * Verify and format the value as a path, respecting valid expressions
 * and placeholders.
 */
const verifyPath = (
  _source: any,
  props: PropertyLookup,
  value: any,
  type?: 'path' | 'relative-path'
): Resolution => {
  if (Array.isArray(value)) {
    const parts = value.map((part) => verifyString(props, part))
    const joined: string = path.join.apply(
      null,
      parts.map((p) => p.value)
    )
    return {
      method: 'path-concatenation',
      value: type === 'relative-path' ? joined : path.resolve(joined),
      parts: value,
      resolutions: parts,
    }
  } else if (typeof value === 'string') {
    return verifyString(props, value)
  } else if (typeof value === 'object') {
    if (typeof value.ref === 'string') {
      return {
        method: 'reference',
        reference: value.ref,
        value: props.lookup(value.ref),
      }
    }
  }
}

const verifyObject = (_source: any, props: PropertyLookup, value: any): Resolution => {
  if (typeof value === 'object') {
    if (typeof value.ref === 'string') {
      const result = props.lookup(value.ref)
      return {
        method: 'reference',
        reference: value.ref,
        value: result,
      }
    }
    return {
      method: 'literal',
      value,
    }
  }
}
