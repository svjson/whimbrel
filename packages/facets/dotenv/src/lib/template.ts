import { DotEnvFile } from '@src/adapters'
import { pushDistinct } from '@whimbrel/array'

/**
 * Describes a "node" in a dotenv profile hierarchy.
 *
 * A profile node represents a .env file (or a missing .env file)
 * and its associated properties, as well as any template parents.
 *
 * .env.template is considered to be a parent of .env
 */
export type ProfileNode = {
  fileName: string
  exists: boolean
  properties: string[]
  missingProperties: string[]
  parents: { [fileName: string]: ProfileNode }
  dotEnvFile?: DotEnvFile
}

/**
 * Convert a file name or DotEnvFile instance into a ProfileNode.
 *
 * @param file The file name or DotEnvFile instance
 * @param exists Whether the file exists on disk.
 */
export const toProfileNode = (
  file: string | DotEnvFile,
  exists: boolean = true
): ProfileNode => {
  if (typeof file === 'string') {
    return {
      fileName: file,
      exists,
      properties: [],
      missingProperties: [],
      parents: {},
    }
  }

  return {
    fileName: file.getFileName(),
    exists,
    properties: file.propertyNames(),
    missingProperties: [],
    parents: {},
    dotEnvFile: file,
  }
}

/**
 * Recursively enumerate all property names/keys in a profile node and its parents.
 *
 * @param node The profile node to enumerate
 * @returns An array of distinct property names/keys
 */
export const enumerateProfileProperties = (node: ProfileNode): string[] => {
  const props = [...node.properties]

  for (const parent of Object.values(node.parents)) {
    pushDistinct(props, ...enumerateProfileProperties(parent))
  }

  return props
}

/**
 * Recursively get all template profiles for a given profile node.
 *
 * A node is considered to be a template if it contains no parents.
 *
 * @param node The profile node to get templates for
 * @returns An array of template profile nodes
 */
export const getTemplateProfiles = (node: ProfileNode): ProfileNode[] => {
  if (!Object.keys(node.parents).length) {
    return [node]
  }
  return Object.values(node.parents).flatMap((p) => {
    return getTemplateProfiles(p)
  })
}

/**
 * Recursively flatten a profile node and its parents into a single array.
 *
 * @param node The profile node to flatten
 * @returns An array of profile nodes
 */
export const flattenProfile = (node: ProfileNode): ProfileNode[] => [
  node,
  ...Object.values(node.parents).flatMap(flattenProfile),
]

/**
 * Find missing properties in a profile node and its parents.
 *
 * @param node The profile node to check
 * @returns The profile node with missingProperties populated
 */
export const findMissingProfileProperties = (node: ProfileNode): ProfileNode => {
  const allProps = enumerateProfileProperties(node)

  for (const n of flattenProfile(node)) {
    n.missingProperties = allProps.filter((p) => !n.properties.includes(p))
  }

  return node
}

/**
 * Group an array of .env file names or DotEnvFile instances into
 * profiles, depending on file suffixes.
 *
 * Files with suffixes of `.template` or `.example` are considered
 * to be templates for the base file name.
 *
 * For example, `.env.template` is considered to be a template
 * for `.env`.
 *
 * @param files An array of file names or DotEnvFile instances
 * @returns A record of profile nodes, keyed by base file name
 */
export const groupByFileNameProfile = (
  files: (string | DotEnvFile)[]
): Record<string, ProfileNode> => {
  const nodes = files
    .map((f) => toProfileNode(f))
    .sort((a, b) => a.fileName.localeCompare(b.fileName))

  const groups: Record<string, ProfileNode> = {}

  for (const node of nodes) {
    const [...parts] = node.fileName.split('.')
    if (['template', 'example'].includes(parts.at(-1))) {
      parts.pop()
      const rootName = `${parts.join('.')}`
      const child = (groups[rootName] ??= toProfileNode(rootName, false))
      child.parents[node.fileName] = node
    } else {
      groups[node.fileName] = node
    }
  }

  for (const node of Object.values(groups)) {
    findMissingProfileProperties(node)
  }

  return groups
}
