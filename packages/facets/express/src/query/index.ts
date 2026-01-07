import type { QueryIndex } from '@whimbrel/core-api'
import { queryHttpAdapterPort } from './http-adapter.port'

export const queryIndex: QueryIndex = {
  'http-adapter:port': queryHttpAdapterPort,
}
