import { describe, it, expect } from 'vitest'

import { unique } from '@src/index'

describe('unique()', () => {
  it('should return a new array of unique strings', () => {
    expect(
      unique([
        'prisma:generate',
        'build',
        'lint',
        'build',
        'build:apps',
        'lint',
        'prisma:generate',
        'prisma:force-generate',
      ])
    ).toEqual(['prisma:generate', 'build', 'lint', 'build:apps', 'prisma:force-generate'])
  })

  it('should return a new array of unique elements identified by field', () => {
    expect(
      unique(
        [
          { name: 'prisma:generate', script: 'aaaaaa' },
          { name: 'build', script: 'bbbbbb' },
          { name: 'lint', script: 'cccccc' },
          { name: 'build', script: 'dddddd' },
          { name: 'build:apps', script: 'eeeeee' },
          { name: 'lint', script: 'ffffff' },
          { name: 'prisma:generate', script: 'gggggg' },
          { name: 'prisma:force-generate', script: 'hhhhhh' },
        ],
        { select: 'name' }
      )
    ).toEqual([
      { name: 'prisma:generate', script: 'aaaaaa' },
      { name: 'build', script: 'bbbbbb' },
      { name: 'lint', script: 'cccccc' },
      { name: 'build:apps', script: 'eeeeee' },
      { name: 'prisma:force-generate', script: 'hhhhhh' },
    ])
  })
})
