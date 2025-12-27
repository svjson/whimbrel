import { PropertiesFile } from '@whimbrel/struct-file'
import type {
  StructuredFileCtorParams,
  PropertiesFileCtorParams,
  PropertiesFileModel,
} from '@whimbrel/struct-file'

/**
 * Adapter for .env files, extending the PropertiesFile class from
 * @whimbrel/struct-file.
 *
 * This class is an implementation of StructuredFile specifically designed
 * to handle .env files, which are commonly used for environment
 * configuration in applications.
 *
 * Uses '=' as the key-value separator.
 */
export class DotEnvFile extends PropertiesFile {
  constructor(params: StructuredFileCtorParams<PropertiesFileModel, string>) {
    super({ ...params, kvSeparator: '=' })
  }
}
