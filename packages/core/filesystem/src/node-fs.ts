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

export const makeEnoentError = (path: string, syscall: string) => {
  const err = Error(
    `ENOENT: no such file or directory, ${syscall} '${path}'`
  ) as NodeJS.ErrnoException
  err.code = 'ENOENT'
  err.errno = -2 // Node typically uses -2 for ENOENT, but value isn’t critical
  err.path = path
  err.syscall = syscall
  return err
}
