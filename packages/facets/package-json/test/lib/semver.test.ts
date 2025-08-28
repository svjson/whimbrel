import { describe, expect, it } from 'vitest'

import {
  parseVersion,
  versionString,
  updateVersion,
  updateVersionString,
} from '@src/index'

describe('SemVer', () => {
  describe('parseVersion', () => {
    it('should parse version string with range', () => {
      expect(parseVersion('^8.0.0')).toEqual({
        major: 8,
        minor: 0,
        patch: 0,
        range: '^',
        pinned: false,
      })

      expect(parseVersion('~8.2.1')).toEqual({
        major: 8,
        minor: 2,
        patch: 1,
        range: '~',
        pinned: false,
      })
    })

    it('should parse semver versions with suffixes', () => {
      expect(parseVersion('^5.1.0-rc.0')).toEqual({
        major: 5,
        minor: 1,
        patch: 0,
        range: '^',
        pinned: false,
        suffix: '-rc.0',
      })
    })
  })

  describe('versionString', () => {
    it('should stringify a pinned version', () => {
      expect(
        versionString({
          major: 3,
          minor: 4,
          patch: 5,
          range: null,
          pinned: true,
        })
      ).toEqual('3.4.5')
    })

    it('should stringify a version with range', () => {
      expect(
        versionString({
          major: 3,
          minor: 4,
          patch: 5,
          range: '^',
          pinned: false,
        })
      ).toEqual('^3.4.5')
    })

    it('should stringify a version and omit range with stripPrefix=true', () => {
      expect(
        versionString(
          {
            major: 3,
            minor: 4,
            patch: 5,
            range: '^',
            pinned: false,
          },
          {
            stripPrefix: true,
          }
        )
      ).toEqual('3.4.5')
    })
  })

  describe('updateVersion', () => {
    it('should update a plain semver to the target version', () => {
      expect(updateVersion('0.1.0', '1.2.8')).toEqual({
        major: 1,
        minor: 2,
        patch: 8,
        pinned: true,
        range: null,
      })
    })

    it('should update a semver and keep the range prefix', () => {
      expect(updateVersion('^0.1.0', '1.2.8')).toEqual({
        major: 1,
        minor: 2,
        patch: 8,
        pinned: false,
        range: '^',
      })
    })

    it('should update a semver and keep suffix', () => {
      expect(updateVersion('0.1.0-rc.1', '1.2.8')).toEqual({
        major: 1,
        minor: 2,
        patch: 8,
        pinned: true,
        range: null,
        suffix: '-rc.1',
      })
    })
  })

  describe('updateVersionString', () => {
    it('should update a plain semver to the target version', () => {
      expect(updateVersionString('0.1.0', '1.2.8')).toEqual('1.2.8')
    })

    it('should update a semver and keep the range prefix', () => {
      expect(updateVersionString('^0.1.0', '1.2.8')).toEqual('^1.2.8')
    })

    it('should update a semver and keep suffix', () => {
      expect(updateVersionString('0.1.0-rc.1', '1.2.8')).toEqual('1.2.8-rc.1')
    })
  })
})
