import { randomBytes } from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { DiskFileSystem } from '@src/index'

describe('DiskFileSystem', () => {
  describe('isDirectory', () => {
    it('should return false for non-existing path', async () => {
      const rndPart = randomBytes(3).toString('hex').slice(0, 6)
      const dirPath = path.join(os.tmpdir(), `whim-dir-${rndPart}`)

      expect(await DiskFileSystem.exists(dirPath)).toBe(false)
    })
  })
})
