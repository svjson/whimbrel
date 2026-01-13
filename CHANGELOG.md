# Changelog

## [UNRELEASED]

### Added

**@whimbrel/package-json**
- Task - npm:rename-script


### Changed

**@whimbrel/script-parser**
- Multiple values for token/text criteria on state transitions, with any-of semantics

**@whimbrel/array**
- `juxt` now supports any number of arrays


### Fixes

- Fixed overzealous reliance on peerDependencies, causing dependency mismatch in consuming projects


---


## [0.1.0] - 2026-01-09

Recognize actors/projects that use dotenv configuration, provide HTTP services and granular analysis of package.json scripts

Use cases:
- Migrate npm projects to pnpm with a single command
- Update informal .env(.template/.example) files with missing example properties
- Determine http port of project submodules


### Added

**whimbrel-cli**:
- Command - *query* - Execute facet queries by name from CLI
- Option - *--max-materialization-iterations*

**@whimbrel/core-api**:
- Feature - Allow facets to provide their own strategy for merging facet configs, when the same facet is detected/advised from multiple sources.
- Types and constants for core facet roles
- Types for description of script and script intent
- Introduced ActorRole
- Introduced Artifact
- Features - Query type-specific query criteria
- Type-safety and inference for core facet query types

**@whimbrel/core**:
- Feature - literal default values for task parameters

**@whimbrel/flow**:
- Feature - **doEach** - for iteration of sequence types in flow NS.

**@whimbrel/struct-file**:
- Feature - PropertiesFile-adapter for basic key-value property file formats

**@whimbrel/script-parser**:
- Parser engine for script statements
- Composable parser architecture with pluggable tokenizers, grammars and node emitters.

**@whimbrel/walk**:
- Function - *closestAncestor* - Find matching ancestors of object path
- Option to make *resolve* provide resolution metadata

**@whimbrel/filesystem**:
- Feature - ReadThroughFileSystem - InMemoryFileSystem that requires no warm-up. Read from physical, write to shadowing in-memory layer.

**@whimbrel/actor**:
- Task - actor:delete-facet-artifacts

**@whimbrel/dotenv** (New Package):
- Facet for dotenv files
- Feature - DotEnvFile-adapter
- Task - dotenv:compare
- Task - dotenv:update-templates

**@whimbrel/express** (New Package):
- Facet for ExpressJS
- Query - http-adapter:port

**@whimbrel/fastify** (New Package):
- Facet for Fastify
- Query - http-adapter:port

**@whimbrel/koa** (New Package):
- Facet for KoaJS
- Query - http-adapter:port

**@whimbrel/npm**:
- Feature - Command parser for npm commands
- Query - package-manager:artifacts
- Query - package-manager:explain-script

**@whimbrel/pnpm**:
- Task - pnpm:set-workspace-dependencies
- Task - pnpm:migrate-project
- Task - pnpm:migrate-scripts
- Task - pnpm:migrate-submodule
- Task - pnpm:migrate-workspaces
- Query - package-manager:artifacts
- Feature - Write/rewrite package manager scripts from script intent

**@whimbrel/tsconfig-json**:
- Query - project:source-folders

**@whimbrel/typescript** (New Package):
- Facet for TypeScript projects
- Feature - source lookup via static code analysis
- Query - language:invocation

**@whimbrel-test/asset-fixtures**:
- Added tarballs of example git repositories
- Added various TypeScript example files that initialize Koa/Fastify/Express


### Changes

**@whimbrel/core**:
- Speed up materialization and dry runs by using ReadThroughFileSystem and eliminating preparation of InMemoryFileSystem
- Child processes are launched with `child_process.spawn` instead of promisified `exec`.
- Storing input resolution metadata in `step.meta` during plan materialization.
- Configurable iteration limit for materialization phase

**@whimbrel/flow**:
- Make journal-formatting options type-safe in regards to the flow NS / let forms

**@whimbrel/struct-file**:
- Make the structured file base less reliant on @whimbrel/core-api constructs

**@whimbrel/actor**:
- Changed reporting of actor:discover-facets to include more role groupings

**@whimbrel/pnpm**:
- Now using fallback strategies for determining pnpm version.

**@whimbrel/target**:
- Detect and set root flag during define:target if target is root project


### Fixes

**whimbrel-cli**:
- Bug - Fixed broken *--silent* flag
- Bug - Fixed broken *--plain* flag

**@whimbrel/core**:
- Bug - Fixed bug where step augmentations were sometimes applied twice during materialization

**@whimbrel/walk**:
- Bug - *mergeLeft* - Fixed issue with handling of empty objects, leading to incorrect results

**@whimbrel/filesystem**:
- Bug - Fixed incomplete FileEntry instance emitted by scanDir under some conditions
- BUg - Added missing mutation reporting for *rmdir*

**@whimbrel/package-json**:
- Bug - fixed writing of license to wrong json field.

**@whimbrel/source**:
- Bug - Only skip memory-import of actor file tree if it actually exists on the target fs

**@whimbrel/target**:
- Bug - Only skip memory-import of actor file tree if it actually exists on the target fs


---


## [0.0.6] - 2025-09-21

Better error handling, host command interaction, git repository awareness and adapting the Whimbrel FileSystem abstraction to nodes fs interface

Use cases:
- Determining docker-compose.yaml services
- Import git repository into an existing repository with retained commit history


### Added

**@whimbrel/core-api**:
- Feature - Run host system commands managed by WhimbrelContext

**@whimbrel/core**:
- Feature - Error types and handling for attempts to perform operations not allowed during a dry run

**@whimbrel/walk**:
- Function - *diff* - Calculate diffs between objects
- Funcfion - *diff3Way* - Calculate 3-way diffs between objects

**@whimbrel/filesystem**:
- Feature - Adapters for wrapping FileSystem with a `node:fs` or `node:fs/promises`-compatible interface
- Feature - Added `size` and `timestamp` method to FileSystem

**@whimbrel/docker-compose** (New Package):
- Facet for docker-compose files
- Feature - DockerComposeYaml-adapter

**@whimbrel/git** (New Package):
- Facet for git and git repositories
- Task - git:import
- Feature - isomorphic-git adapter

**@whimbrel/gitignore**:
- Feature - match .gitignore entries against directory contents/file names

**@whimbrel/package-json**:
- Task - package.json:resolve-conflict

**@whimbrel-test/asset-fixtures**:
- Test package that provides ready-made assets for testing purposes


### Changes

**@whimbrel/struct-file**:
- **StructuredFile.write** now accepts optional path override


---


## [0.0.5] - 2025-09-13

Support dry runs for all types of executions, materialization phase optimizations and schemas for structured files.


### Added

**whimbrel-cli**:
- Flag - Added *--dry-run* flag
- Option - Added *--cat* / *-c* for outputting file contents from context after command execution

**@whimbrel/core-api**:
- Feature - Introduced FileAccessMode for tasks and plans

**@whimbrel/struct-file**:
- Feature - Added schemas for structured files

**@whimbrel/tsconfig-json**:
- Feature - TSConfigJSON-adapter
- Task - tsconfig.json:clean


### Changes

**@whimbrel/core**:
- Defer usage and overhead of InMemoryFileSystem as long as plans/tasks contain no write operations.

**@whimbrel/source**:
- Skip reading source actor directory trees into ctx filesystem if it is physical

**@whimbrel/target**:
- Skip reading source actor directory trees into ctx filesystem if it is physical


### Fixed

**whimbrel-cli**:
- Bug - fixed issue where the command pre-parser swallowed the help command

**@whimbrel/license**:
- Bug - fixed faulty self-import

**@whimbrel/package-json**:
- Bug - PackageJSON - fixed incorrect reference to storage adapter


---


## [0.0.4] - 2025-09-01

Bug fixes, renamed the CLI package to avoid collision with an existing and abandoned npmjs package.

Use cases:
- Support for pnpm projects


### Added

**whimbrel-cli** (New Package):
- Renamed from **whimbrel**

**whimbrel/struct-file**:
- Feature - Added YamlFile-adapter
- Feature - Generator function for static file access adapter methods.

**@whimbrel/license** (New Package):
- Facet for project licenses
- Task - license:apply - "apply" a license to an actor
- Task - license:create-file - create a LICENSE file

**@whimbrel/package-json**:
- Task - package.json:set-property
- Augment license:apply to set license property of package.json
- Feature - lib functions for resolving workspace definition globs

**@whimbrel/pnpm**:
- Feature - Detect workspaces/submodules, as defined by pnpm
- Feature - PnpmWorkspaceYaml-adapter for reading/writing pnpm-workspace.yaml

### Changed

**@whimbrel/core**:
- Use `modify` over `changed` when reporting file system mutations.

**whimbrel-cli**:
- *execute* - Target root module of root actor by default/if no target is specified

**@whimbrel/turborepo**:
- TurboJSON-adapter - added static file access methods

### Removed

**whimbrel** (Removed Package):
- Package renamed to **whimbrel-cli**):

### Fixed

**whimbrel-cli**:
- Broken path of bin entry in package.json

**@whimbrel/source**:
- Fixed definition of duplicate actor IDs

**@whimbrel/target**:
- Fixed definition of duplicate actor IDs


---


## [0.0.3] - 2025-08-28

Minor service release.

Use cases:
- Consistently update nested package.json versions


### Added

**@whimbrel/core-api**:
- Function - *makeTaskParameter* - stream-lined definition of task parameter
- Function - *makeTaskParameters* - stream-lined definition of task parameters

**@whimbrel/package-json**:
- Task - package.json:set-version
- PackageJSON-adapter - path and disk/fs-abstraction are now optional

**@whimbrel**:
- *execute* - Expose task parameters as command-line parameters

### Changed

**@whimbrel/core**:
- *ctx.getActor* by criteria no longer requires ActorType
- *ctx.getActor* can now find actor by actor name (in addition to ActorId)
- *ctx.getActor* can now find actor by `hasSubmodule` criteria


---


## [0.0.2] - 2025-08-28

Release providing better actor resolution, access to facet details and treating
facet packages as feature-providing libraries in addition to simply being "facet modules"
for whimbrel.


### Added

**whimbrel**
- Flag - *--show-facet-details* - Output collected facet details at end of execution

**@whimbrel/core-api**:
- Function - *ctx.getActor* - look up actor by id or criteria
- Function - *actorFacetScope* - look up scope of actor facet
- Function - *actorFacetConfig* - look up config of actor facet
- Feature - supply step inputs through default values and/or references

**@whimbrel/core**:
- Feature - Track mutation of actor properties
- Feature - Use expectation trees to determine if plan materialization is completed

**@whimbrel/facet**:
- Feature - Ranking of facet query results from multiple sources

**@whimbrel/array**:
- Function - *leftPad* for ensuring array size, padded with default value.

**@whimbrel/struct-file** (New Package):
- StructuredFile base API
- Feature - JSONFile adapter, with support for enforcing key order

**@whimbrel/actor**:
- Task - actor:reify - adjust actor basics after discovery process

**@whimbrel/package-json**:
- Query - actor:canonical-name
- Feature - PackageJSON-adapter, based on struct-file/JSONFile

**@whimbrel/turborepo**:
- Feature - Detect presence of turborepo in node projects
- Feature - TurboJSON-adapter, based on struct-file/JSONFile


### Changed

**@whimbrel/core**:
- Allow non-persistent errors during materialization phase
- Improve materialization phase times by exhausting step expansion before attempting dry run


### Fixed

**@whimbrel/core**:
- Bug - step bindings were not applied before step execution was prepared for steps created at the end of the materialiation phase


---


## [0.0.1] - 2025-08-25

Initial release containing the foundations of the execution engine and its components, basic set of minimal facets and CLI package.

Use cases:
- Auto-generate .gitignore files
- Apply a license identified by spdx to a project, inferring license metadata and ownership from project facets


### Added

**whimbrel**: (New Package)
- command-line interface (CLI) for task execution
- Command - *f* - Decribe a facet
- Command - *x* / *execute* - Execute a task by ID
- Command - *z* / *analyze* - Analyze a directory on disk

**@whimbrel/core-api** (New Package):
- Core types and convenience functions

**@whimbrel/core** (New Package):
- Feature - Plan formulation and materialization
- Feature - Dry run of plans, plan steps and tasks
- Feature - Log abstraction for hierarchically indented output
- Feature - Plan execution, abstractions for task/step execution

**@whimbrel/facet** (New Package): 
- Utility functions and API for defining facets

**@whimbrel/filesystem** (New Package):
- Feature - FileSystem-implementation for physical/real filesystem
- Feature - FileSystem-implementation for in-memory/virtual filesystem
- Feature - Mutation reporting via wrapper interface for concrete implementations

**@whimbrel/walk**: Lib - Utility library for walking, analyzing and modifying objects
- Function - *walk* - generic walking of each node/entry of an object
- Function - *walkPath* - traverse a nested path of an object, optionally performing an operation at each step
- Function - *mergeLeft* for deep merging objects, from right to left
- Function - *resolve* - traverse and extract, coerce or resolve placeholder from an object based on the expected type
- Function - *containsAll* - short hand for equality check of multiple properties and at different nested paths

**@whimbrel/array**: (New Package):
- Function - *concatDistinct* for concatenating arrays with set semantics, identity determined by ===
- Function - *concatUnique* for concatenating arrays with set semantics, identity determined by deep equality
- Function - *pushDistinct* for pushing elements into arrays with semantics, identity determined by ===
- Function - *pushUnique* for concatenating arrays with set semantics, identity determined by deep equality
- Function - *includesEqual* for member check based on deep equality
- Function - *unique* for ensuring set semantics, optionally performing identity check on object path
- Function - *juxt* for juxtaposing the elements of two arrays into a single array of tuples

**@whimbrel/flow**: 
- flow DSL utility, streamlining task operations and reporting
- *let* for defining and reporting variables
- *do* for performing operations using defined variables as input

**@whimbrel/actor** (New Package): 
- Core facet for actor tasks/queries
- Task - actor:analyze
- Task - actor:discover-facets

**@whimbrel/gitignore** (New Package):
- Facet for .gitignore files
- Task - gitignore:create for creating .gitignore files based on project/actor facets

**@whimbrel/node** (New Package):
- Facet for NodeJS as engine
- Query - version-control:ignore-files

**@whimbrel/npm** (New Package):
- Facet for npm as package manager

**@whimbrel/package-json** (New Package):
- Facet for package.json interactions
- Task - package.json:add-script
- Task - package.json:remove-script

**@whimbrel/pnpm** (New Package):
- Facet for pnpm as package manager
- Query - version-control:ignore-files

**@whimbrel/project** (New Package):
- Facet for treating actors as projects
- Task - project:define-submodules
- Task - project:each-submodule

**@whimbrel/source** (New Package):
- Facet for treating actors as sources
- Task - source:define

**@whimbrel/target** (New Package):
- Facet for treating actors as targets
- Task - target:define

**@whimbrel/tsconfig-json** (New Package):
- Facet for tsconfig.json interactions
- Query - version-control:ignore-files

**@whimbrel/turborepo** (New Package):
- Facet for turborepo
- Query - version-control:ignore-files

**@whimbrel-test/context-fixtures** (New Package):
- Package for managing WhimbrelContext in tests

**@whimbrel-test/step-execution-fixtures** (New Package):
- Test fixtures providing a structured way to test step/task execution and comparing live/dry run results

**@whimbrel-test/step-fixtures** (New Package):
- Test fixtures for managing plan steps

**@whimbrel-test/tree-fixtures** (New Package):
- Test fixtures for creating and managing file system pre-conditions
