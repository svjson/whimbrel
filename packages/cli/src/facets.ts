import Actor from '@whimbrel/actor'
import DockerCompose from '@whimbrel/docker-compose'
import DotEnv from '@whimbrel/dotenv'
import Express from '@whimbrel/express'
import Fastify from '@whimbrel/fastify'
import Git from '@whimbrel/git'
import GitIgnore from '@whimbrel/gitignore'
import License from '@whimbrel/license'
import Koa from '@whimbrel/koa'
import Node from '@whimbrel/node'
import Npm from '@whimbrel/npm'
import PackageJson from '@whimbrel/package-json'
import Pnpm from '@whimbrel/pnpm'
import Project from '@whimbrel/project'
import Source from '@whimbrel/source'
import Target from '@whimbrel/target'
import TsConfigJson from '@whimbrel/tsconfig-json'
import Turbo from '@whimbrel/turborepo'
import TypeScript from '@whimbrel/typescript'
import Vite from '@whimbrel/vite'

import { DefaultFacetRegistry } from '@whimbrel/facet'
import { FacetRegistry } from '@whimbrel/core-api'

/**
 * Build the standard FacetRegistry containg all stock Whimbrel facets.
 */
export const makeFacetRegistry = (): FacetRegistry => {
  return new DefaultFacetRegistry([
    Actor,
    DockerCompose,
    DotEnv,
    Express,
    Fastify,
    Git,
    GitIgnore,
    License,
    Koa,
    Node,
    Npm,
    PackageJson,
    Pnpm,
    Project,
    Source,
    Target,
    TsConfigJson,
    Turbo,
    TypeScript,
    Vite,
  ])
}
