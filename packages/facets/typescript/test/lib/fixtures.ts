import { SourceReference } from '@src/lib'

export const stripASTDetails = (refs: SourceReference | SourceReference[]) => {
  if (Array.isArray(refs)) {
    return refs.map(stripASTDetails)
  }

  const dupe = { ...refs } as any
  delete dupe.ast
  delete dupe.type
  delete dupe.node
  ;['name', 'argIndex', 'resolutions'].forEach((key) => {
    if (Array.isArray(dupe[key])) dupe[key] = stripASTDetails(dupe[key])
  })
  return dupe
}
