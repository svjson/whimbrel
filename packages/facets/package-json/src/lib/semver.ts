export type SemVer = {
  major: number
  minor: number
  patch: number
  range: string | null
  pinned: boolean
  suffix?: any
}

export const parseVersion = (input: string): SemVer | null => {
  const match = input.match(/^([~^])?(\d+)\.(\d+)\.(\d+)(.*)*$/)
  if (!match) {
    return null
  }
  const [, prefix, major, minor, patch, suffix] = match
  const version: SemVer = {
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch),
    range: prefix || null,
    pinned: !prefix,
    ...(suffix ? { suffix } : {}),
  }
  return version
}

const ensureSemVer = (v: string | SemVer) => {
  if (typeof v === 'string') return parseVersion(v)
  return v
}

export const isVersion = (v1: string | SemVer, v2: string | SemVer) => {
  if (v1 === v2) return true

  v1 = ensureSemVer(v1)
  v2 = ensureSemVer(v2)

  return v1?.major == v2?.major && v1?.minor == v2?.minor && v1?.patch === v2?.patch
}

export const updateVersion = (from: string | SemVer, to: string | SemVer) => {
  from = ensureSemVer(from)
  to = ensureSemVer(to)

  const result = { ...from }
  result.major = to.major
  result.minor = to.minor
  result.patch = to.patch

  return result
}

export const updateVersionString = (from: string | SemVer, to: string | SemVer) => {
  const updated = updateVersion(from, to)
  return versionString(updated)
}

export const stripVersionPrefix = (versionStr: string) => {
  const parsed = parseVersion(versionStr)
  if (parsed) {
    return versionString(parsed, { stripPrefix: true })
  }
  return versionStr
}

export const versionString = (
  v: SemVer,
  opts: { stripPrefix?: boolean } = {}
): string => {
  const { stripPrefix } = opts
  const semVer = `${v.major}.${v.minor}.${v.patch}${v.suffix ? v.suffix : ''}`
  if (stripPrefix) return semVer
  return `${v.range ? v.range : ''}${semVer}`
}

export const highestVersion = (...versions: (string | SemVer)[]) => {
  return versions.sort(VERSION_COMPARATOR)[0]
}

export const VERSION_COMPARATOR = (a: SemVer | string, b: SemVer | string) => {
  a = typeof a === 'string' ? parseVersion(a) : a
  b = typeof b === 'string' ? parseVersion(b) : b

  if (a.major !== b.major) return b.major - a.major
  if (a.minor !== b.minor) return b.minor - a.minor
  if (a.patch !== b.patch) return b.patch - a.patch

  const rangeOrder = [undefined, '~', '^']
  return rangeOrder.indexOf(b.range) - rangeOrder.indexOf(a.range)
}
