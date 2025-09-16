export type NodeFileSystem = {
  readFile: Function
  writeFile: Function
  unlink: Function
  readdir: Function
  exists: Function
  mkdir: Function
  rmdir: Function
  stat: Function
  lstat: Function
  readlink?: Function | undefined
  symlink?: Function | undefined
  chmod?: Function | undefined
}

export type NodePromisesFileSystem = {
  promises: {
    readFile: Function
    writeFile: Function
    unlink: Function
    readdir: Function
    mkdir: Function
    rmdir: Function
    stat: Function
    lstat: Function
    readlink?: Function | undefined
    symlink?: Function | undefined
    chmod?: Function | undefined
  }
}
