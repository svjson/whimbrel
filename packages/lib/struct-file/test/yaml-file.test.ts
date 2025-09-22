import { PropertyPath } from '@whimbrel/walk'
import { describe, expect, it } from 'vitest'
import { YamlFile } from '@src/index'

const dummyKubeYaml = new YamlFile({
  content: [
    'apiVersion: v1',
    'kind: Service',
    'metadata:',
    '  name: web-application',
    'spec:',
    '  ports:',
    '    - port: 80',
    '  selector:',
    '    app: web-application',
  ].join('\n'),
})

describe('YamlFile', () => {
  describe('get', () => {
    it.each([
      ['apiVersion', 'v1'],
      [['apiVersion'], 'v1'],
      ['kind', 'Service'],
      [['kind'], 'Service'],
    ] as [PropertyPath, string][])(
      'should read root level string property %o',
      (propertyPath, expectedValue) => {
        expect(dummyKubeYaml.get(propertyPath)).toEqual(expectedValue)
      }
    )

    it.each([
      ['metadata.name', 'web-application'],
      [['metadata', 'name'], 'web-application'],
      ['spec.selector.app', 'web-application'],
      [['spec', 'selector', 'app'], 'web-application'],
    ])('should read nested string property %o', (propertyPath, expectedValue) => {
      expect(dummyKubeYaml.get(propertyPath)).toEqual(expectedValue)
    })

    it('should read nested array of dict/object', () => {
      expect(dummyKubeYaml.get('spec.ports')).toEqual([
        {
          port: 80,
        },
      ])
    })

    it('should return provided default value if not present', () => {
      expect(dummyKubeYaml.get('krakelibrankelfnatt', 'jojomen')).toEqual('jojomen')
    })
  })

  describe('set', () => {
    it('should set a string property at root level', () => {
      const yml = new YamlFile()
      yml.set('version', '2.0')

      expect(yml.get('version')).toEqual('2.0')

      expect(yml.toString()).toEqual('version: "2.0"\n')
    })

    it('should set a property with array of string value at root level', () => {
      const yml = new YamlFile()
      yml.set('packages', ['services/*', 'apps/*', 'libs/*'])

      expect(yml.get('packages')).toEqual(['services/*', 'apps/*', 'libs/*'])
    })
  })
})
