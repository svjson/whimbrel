export interface TmpDir {
  path: string
}

const TMP_DIRS: TmpDir[] = []

export const trackTmpDir = (path: string) => {
  TMP_DIRS.push({ path })
}
