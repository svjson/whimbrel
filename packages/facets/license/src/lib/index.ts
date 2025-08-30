import { Actor, FacetQuery, WhimbrelContext } from '@whimbrel/core-api'
import { pickRankedResult, queryFacets } from '@whimbrel/facet'

const SOURCE_RANK_ORDER = [{ role: 'pkg-file' }, { role: 'engine' }]

export const performQueries = async (
  ctx: WhimbrelContext,
  actor: Actor,
  extractValue: (result: any) => string | undefined,
  queries: FacetQuery[],
  defaultValue: string
): Promise<string> => {
  for (const query of queries) {
    const qr = await queryFacets(ctx, actor, query)
    const present = pickRankedResult(actor, qr, SOURCE_RANK_ORDER)
    const value = extractValue(present)
    if (value) return value
  }

  return defaultValue
}

export const resolveSpdx = async (
  ctx: WhimbrelContext,
  actor: Actor
): Promise<string> => {
  return await performQueries(
    ctx,
    actor,
    (result) => result?.spdx,
    [
      {
        type: 'project:license',
        actor,
      },
      {
        type: 'license:context-default',
        actor,
      },
    ],
    'MIT'
  )
}

export const resolveCopyrightYear = async (
  ctx: WhimbrelContext,
  actor: Actor
): Promise<string> => {
  return await performQueries(
    ctx,
    actor,
    (result) => result?.year,
    [
      {
        type: 'project:license',
        actor,
      },
    ],
    String(new Date().getFullYear())
  )
}

export const resolveAuthor = async (
  ctx: WhimbrelContext,
  actor: Actor
): Promise<string> => {
  return await performQueries(
    ctx,
    actor,
    (result) => result?.author || result?.authors?.join(', '),
    [
      {
        type: 'project:metadata',
        actor,
      },
    ],
    'Authors'
  )
}

export const resolveCopyrightHolder = async (
  ctx: WhimbrelContext,
  actor: Actor,
  defaultValue: string
): Promise<string> => {
  return await performQueries(
    ctx,
    actor,
    (result) => result?.copyrightHolders?.join(', '),
    [
      {
        type: 'project:metadata',
        actor,
      },
    ],
    defaultValue
  )
}

export const resolveOwner = async (
  ctx: WhimbrelContext,
  actor: Actor,
  defaultValue: string
): Promise<string> => {
  return await performQueries(
    ctx,
    actor,
    (result) => result?.owner,
    [
      {
        type: 'project:metadata',
        actor,
      },
    ],
    defaultValue
  )
}
