/** Generic async operation state */
export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/** Pagination params */
export interface PaginationParams {
  limit: number
  offset: number
}

/** Sort direction */
export type SortDirection = 'asc' | 'desc'

/** Result type for operations that can fail */
export type Result<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E }

/** Active chat target — either a channel or a conversation */
export type ChatTarget =
  | { type: 'channel'; id: string }
  | { type: 'conversation'; id: string }
  | null
