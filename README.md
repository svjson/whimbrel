
# Whimbrel

[![npm version](https://img.shields.io/npm/v/whimbrel-cli.svg)](https://www.npmjs.com/package/whimbrel-cli)
[![GitHub](https://img.shields.io/badge/GitHub-svjson%2Fwhimbrel-blue?logo=github)](https://github.com/svjson/whimbrel)
[![License: ISC](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE)
[![Node](https://img.shields.io/node/v/whimbrel-cli)](https://www.npmjs.com/package/whimbrel-cli)

> Whimbrel is a flexible automation toolkit for development projects. It lets you declare 
> and run tasks across packages, services, and workflows, with facet-specific logic for 
> things like npm, git, Docker, and more.

## Introduction

Whimbrel is both a library and a CLI tool for automating the repetitive chores that creep into everyday development.  
It lets you declare reusable tasks and run them in a consistent way across different parts of a project.  

```bash
# Generate a .gitignore file based on the nature of the project
$ whim x gitignore:create

# Import another git repository into a monorepo while keeping version history
$ whim x git:import --from ~/projects/lonely-microservice --to ./services/new-microservice

# Update a package.json version, keeping any references up to date
$ whim x package.json:set-version --version 2.8.4 --internal-deps
```

Where possible, commands follow a “do what I mean” (DWIM) philosophy, aiming for sensible defaults and minimal boilerplate.
Task execution comes with a `--dry-run` flag so you can inspect what would happen before making changes - because who wants a 
tool to run amok without safeguards?

Facets extend Whimbrel with domain-specific helpers, such as working with `package.json`, interacting with git, or handling Docker builds.  
All facet tasks rely on Whimbrel’s mechanisms to ensure repeatability and control.  

As a library, Whimbrel can be used to compose more complex plans, while the CLI is focused on executing individual tasks.


## Installation

Whimbrel is available on npm as both a CLI and a library.

### CLI

The Whimbrel CLI comes pre-loaded with all facets provided by the Whimbrel Project.

Install globally to use the `whim` command anywhere:

```bash
$ npm install -g whimbrel-cli
```

Or add it as a dev dependency in a project, to use with npx or in package.json scripts.

```bash
$ npm install --save-dev whimbrel-cli
```

### Library

When using Whimbrel as a library, you will have to pick and mix the facets that are
relevant for your project, ie

```bash
$ npm add @whimbrel/core @whimbrel/pnpm @whimbrel/docker-compose @whimbrel/package.json
```

## Philosophy

Whimbrel is shaped by a few guiding ideas:

- **Do what I mean**  
  Commands should feel natural, with sensible defaults and minimal boilerplate. You tell Whimbrel what you want, and it fills in the obvious details.

- **Safety first**  
  Every task supports `--dry-run`, and Whimbrel tracks what it touches. You can always inspect the outcome before committing to changes.

- **Composable by design**  
  Tasks can be combined into larger flows when used as a library, so you can start small and grow into more complex automation.
  Facets and tasks can cooperate through shared mechanisms, so that different domains work together instead of in isolation.

- **Extensible through facets**  
  New domains of functionality are added as facets. Each facet brings focused helpers, such as working with `package.json`, git, or Docker.


## Facets

Whimbrel groups related tasks and functionality into **facets**. Each facet focuses on a specific domain, and provide their own
features and tasks.

While primarily designed to be used as part of Whimbrel Plans and task execution, they can also be useful libraries
on their own.

| Facet                                              | Description                                                                                                                        |
|----------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| [actor](./packages/facets/git)                     | Core Facet dealing with `actor`, which is Whimbrel-speak for "project" or a cohesive folder structure. Not intended for CLI usage. |
| [docker-compose](./packages/facets/docker-compose) | Read/Write/Inspect docker-compose YAML files                                                                                       |
| [dotenv](./packages/facets/dotenv)                 | Inspect, compare and update dotenv files                                                                                           |
| [express](./packages/facets/express)               | Allows detection and querying configuration of Express usage as http-adapter                                                       |
| [fastify](./packages/facets/fastify)               | Allows detection and querying configuration of Fastify usage as http-adapter                                                       |
| [git](./packages/facets/git)                       | Interact with git repositories, backed by either [isomorphic-git](https://isomorphic-git.org/) or plain old git.                   |
| [gitignore](./packages/facets/gitignore)           | Create, maintain, merge or clean up .gitignore files.                                                                              |
| [koa](./packages/facets/koa)                       | Allows detection and querying configuration of Koa usage as http-adapter                                                           |
| [license](./packages/facets/license)               | For dealing with project licenses and LICENSE files                                                                                |
| [node](./packages/facets/node)                     | NodeJS                                                                                                                             |
| [npm](./packages/facets/npm)                       | npm interaction and configuration                                                                                                  |
| [package.json](./packages/facets/package-json)     | Create, maintain, query or edit package.json files.                                                                                |
| [pnpm](./packages/facets/pnpm)                     | pnpm interaction and configuration                                                                                                 |
| [project](./packages/facets/project)               | Core Facet for projects, dealing with project composition                                                                          |
| [source](./packages/facets/source)                 | Core Facet for "Source Actors" - Actors that are considered to be a source for an operation. Not intended for CLI usage.           |
| [target](./packages/facets/target)                 | Core Facet for "Target Actors" - Actors that are the targets of an operation.                                                      |
| [tsconfig.json](./packages/facets/tsconfig.json)   | Create, maintain, clean, extend and configure tsconfig.json files                                                                  |
| [turborepo](./packages/facets/turborepo)           | Configure and analyze turborepo configurations                                                                                     |
| [typescript](./packages/facets/typescript)         | Provides static code-analysis for TypeScript projects                                                                              |
| [vite](./packages/facets/vite)                     | Provides configuration resolution for projects using Vite                                                                          |


## Latest Release - [0.1.3] - 2026-02-01

See [CHANGELOG.md](./CHANGELOG.md) for more information

--

## License

© 2025-2026 Sven Johansson. [ISC Licensed](./LICENSE)

