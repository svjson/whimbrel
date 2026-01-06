import { describe, test, expect } from 'vitest'
import { banner, BannerOptions } from '@src/output'

describe('banner', () => {
  test.each([
    [
      '3 message segments, 3 prefixes, 3 decorators, indentation=0',
      {
        message: ['Execute Task', 'whoop:di-doo', 'main module'],
        indentation: 0,
        prefixes: ['* ', ':', '-'],
        decorators: [(s) => `[${s}]`, (s) => `=>${s}`, (s) => `(${s})`],
      },
      [
        '* [Execute Task]:=>whoop:di-doo-(main module)',
        '---------------------------------------------',
      ],
    ],
    [
      '3 message segments, no prefixes, 3 decorators, indentation=0',
      {
        message: ['Execute Task', 'whoop:di-doo', 'main module'],
        indentation: 0,
        prefixes: [],
        decorators: [(s) => `[${s}]`, (s) => `=>${s}`, (s) => `(${s})`],
      },
      [
        '[Execute Task]=>whoop:di-doo(main module)',
        '-----------------------------------------',
      ],
    ],
    [
      '3 message segments, 3 prefixes, no decorators, indentation=0',
      {
        message: ['Execute Task', 'whoop:di-doo', 'main module'],
        indentation: 0,
        prefixes: ['* ', ': ', ' - '],
        decorators: [],
      },
      [
        '* Execute Task: whoop:di-doo - main module',
        '------------------------------------------',
      ],
    ],
    [
      '5 message segments, 3 prefixes, no decorators, indentation=0',
      {
        message: ['A', 'B', 'C', 'D', 'E'],
        indentation: 0,
        prefixes: ['* ', ': ', ' - '],
        decorators: [],
      },
      ['* A: B - C - D - E', '------------------'],
    ],
    [
      '5 message segments, 3 prefixes, no decorators, indentation=1',
      {
        message: ['A', 'B', 'C', 'D', 'E'],
        indentation: 1,
        prefixes: ['', ': ', ' - '],
        decorators: [],
      },
      ['  A: B - C - D - E', '  ----------------'],
    ],
    [
      '5 message segments, 3 prefixes, no decorators, indentation=4',
      {
        message: ['A', 'B', 'C', 'D', 'E'],
        indentation: 4,
        prefixes: ['', ': ', ' - '],
        decorators: [],
      },
      ['        A: B - C - D - E', '        ----------------'],
    ],
  ] as [string, BannerOptions, string[]][])('%s', (_, opts, expectedLines) => {
    expect(banner(opts)).toEqual(expectedLines)
  })
})
