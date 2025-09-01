import { PropertyPath } from '@whimbrel/walk'
import { describe, expect, it } from 'vitest'
import { YamlFile } from '@src/index'

describe('YamlFile', () => {
  describe('get', () => {
    const yamlFile = new YamlFile({
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

    it.each([
      ['apiVersion', 'v1'],
      [['apiVersion'], 'v1'],
      ['kind', 'Service'],
      [['kind'], 'Service'],
    ] as [PropertyPath, string][])(
      'should read root level string property %o',
      (propertyPath, expectedValue) => {
        expect(yamlFile.get(propertyPath)).toEqual(expectedValue)
      }
    )

    it.each([
      ['metadata.name', 'web-application'],
      [['metadata', 'name'], 'web-application'],
      ['spec.selector.app', 'web-application'],
      [['spec', 'selector', 'app'], 'web-application'],
    ])('should read nested string property %o', (propertyPath, expectedValue) => {
      expect(yamlFile.get(propertyPath)).toEqual(expectedValue)
    })

    it('should read nested array of dict/object', () => {
      expect(yamlFile.get('spec.ports')).toEqual([
        {
          port: 80,
        },
      ])
    })
  })
})
