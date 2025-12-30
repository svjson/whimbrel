/**
 * Role identifier for build configuration facets.
 *
 * Used to identify facets that provide build configuration
 * for a project, such as tsconfig.json or tsup.config.ts.
 */
export type BuildConfigRole = 'build-config'

/**
 * Role identifier for application configuration providers.
 *
 * Used to identify facets that provide runtime configuration
 * for an application, such as dotenv files or config servers.
 */
export type ConfigProviderRole = 'config-provider'

/**
 * Role identifier for engine facets.
 *
 * Used to identify application runtime facets, such as
 * Node.js, Deno or JVM.
 */
export type EngineRole = 'engine'

/**
 * Role identifier for http adapters.
 *
 * Used to identify facets that provide HTTP server functionality
 * to an application, such as Express, Koa or Fastify.
 *
 * These facets typically enable the application to handle
 * HTTP requests and responses.
 */
export type HttpAdapterRole = 'http-adapter'

/**
 * Role identifier for ignore file facets.
 *
 * Used to identify facets that provide ignore file functionality,
 * such as .gitignore or .dockerignore.
 */
export type IgnoreFileRole = 'ignore-file'

/**
 * Role identifier for implementation language facets.
 *
 * Used to identify facets that describe the implementation language
 * of a project, such as TypeScript, JavaScript or Python.
 */
export type ImplementationLanguage = 'language'

/**
 * Role identifier for license facets.
 *
 * Used to identify facets that provide license information, such
 * as LICENSE files, package.json or README.md
 */
export type LicenseRole = 'license'

/**
 * Role identifier for package file facets.
 *
 * Used to identify facets that provide package file functionality,
 * such as package.json or pyproject.toml.
 */
export type PackageFileRole = 'pkg-file'

/**
 * Role identifier for package manager facets.
 *
 * Used to identify facets that provide package manager functionality,
 * such as npm, pnpm, yarn or pip.
 */
export type PackageManagerRole = 'pkg-manager'

/**
 * Role identifier for version control facets.
 *
 * Used to identify facets that provide version control functionality,
 * such as git, svn or mercurial.
 */
export type VersionControlRole = 'version-control'

/**
 * Roles assigned to a facet instance.
 * Each role is a string identifier.
 *
 * These roles can be used to query for facets that fulfill
 */
export type FacetRoles = FacetRole[]

/**
 * Predefined roles that can be assigned to a facet instance.
 *
 * Each role is a string identifier and these roles can be used to query
 * for facets that fulfill specific purposes.
 *
 * A bare `string` is part of the union, as facets may define roles
 * specific to a group that are not part of the main Whimbrel
 * project discovery facilities.
 */
export type FacetRole =
  | BuildConfigRole
  | ConfigProviderRole
  | EngineRole
  | HttpAdapterRole
  | IgnoreFileRole
  | LicenseRole
  | PackageFileRole
  | PackageManagerRole
  | VersionControlRole
  | string
