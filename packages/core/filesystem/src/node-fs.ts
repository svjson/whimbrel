import { WriteFileOptions, ObjectEncodingOptions } from 'node:fs'

export const toEncodingArgument = (
  source:
    | WriteFileOptions
    | ObjectEncodingOptions
    | BufferEncoding
    | { encoding: BufferEncoding }
    | number
) => {
  if (source === undefined || typeof source === 'number') return {}

  if (typeof source === 'string') {
    return { encoding: source }
  }

  if (source?.encoding) {
    return { encoding: source.encoding }
  }

  return {}
}
