import { SourceReference } from '@src/lib'

export const stripASTDetails = (
  refs: SourceReference | SourceReference[],
  keep: string[] = []
) => {
  if (Array.isArray(refs)) {
    return refs.map((r) => stripASTDetails(r, keep))
  }

  const dupe = { ...refs } as any
  ;['id', 'type', 'ast', 'node'].forEach((key) => {
    if (!keep.includes(key)) delete dupe[key]
  })
  if (dupe.value && typeof dupe.value === 'object' && dupe.value.type) {
    dupe.value = stripASTDetails(dupe.value, keep)
  }
  if (dupe.argument?.node && !keep.includes('node')) {
    delete dupe.argument.node
  }
  ;['name', 'entries', 'arguments', 'argIndex', 'resolutions'].forEach((key) => {
    if (Array.isArray(dupe[key]) && !keep.includes(key))
      dupe[key] = stripASTDetails(dupe[key], keep)
  })
  return dupe
}
