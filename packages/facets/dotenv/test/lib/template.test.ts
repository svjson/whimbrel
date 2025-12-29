import { describe, it, expect } from 'vitest'
import { groupByFileNameProfile } from '@src/lib/template'

describe('groupByFileNameProfile', () => {
  it('should return a single node from a list of one file', () => {
    expect(groupByFileNameProfile(['.env'])).toEqual({
      '.env': {
        fileName: '.env',
        exists: true,
        properties: [],
        missingProperties: [],
        parents: {},
      },
    })
  })

  it('should consider ".env.template" a parent of ".env"', () => {
    expect(groupByFileNameProfile(['.env.template', '.env'])).toEqual({
      '.env': {
        fileName: '.env',
        exists: true,
        properties: [],
        missingProperties: [],
        parents: {
          '.env.template': {
            fileName: '.env.template',
            exists: true,
            properties: [],
            missingProperties: [],
            parents: {},
          },
        },
      },
    })
  })

  it('should infer ".env" from ".env.template", but mark as not existing', () => {
    expect(groupByFileNameProfile(['.env.template'])).toEqual({
      '.env': {
        fileName: '.env',
        exists: false,
        properties: [],
        missingProperties: [],
        parents: {
          '.env.template': {
            fileName: '.env.template',
            exists: true,
            properties: [],
            missingProperties: [],
            parents: {},
          },
        },
      },
    })
  })

  it('should consider ".env.example" a parent of ".env"', () => {
    expect(groupByFileNameProfile(['.env.example', '.env'])).toEqual({
      '.env': {
        fileName: '.env',
        exists: true,
        properties: [],
        missingProperties: [],
        parents: {
          '.env.example': {
            fileName: '.env.example',
            exists: true,
            properties: [],
            missingProperties: [],
            parents: {},
          },
        },
      },
    })
  })

  it('should infer ".env" from ".env.example", but mark as not existing', () => {
    expect(groupByFileNameProfile(['.env.example'])).toEqual({
      '.env': {
        fileName: '.env',
        exists: false,
        properties: [],
        missingProperties: [],
        parents: {
          '.env.example': {
            fileName: '.env.example',
            exists: true,
            properties: [],
            missingProperties: [],
            parents: {},
          },
        },
      },
    })
  })

  it('should consider ".env" and ".env.test" as different profiles', () => {
    expect(
      groupByFileNameProfile(['.env.example', '.env.test', '.env.test.template'])
    ).toEqual({
      '.env': {
        fileName: '.env',
        exists: false,
        properties: [],
        missingProperties: [],
        parents: {
          '.env.example': {
            fileName: '.env.example',
            exists: true,
            properties: [],
            missingProperties: [],
            parents: {},
          },
        },
      },
      '.env.test': {
        fileName: '.env.test',
        exists: true,
        properties: [],
        missingProperties: [],
        parents: {
          '.env.test.template': {
            fileName: '.env.test.template',
            exists: true,
            properties: [],
            missingProperties: [],
            parents: {},
          },
        },
      },
    })
  })
})
