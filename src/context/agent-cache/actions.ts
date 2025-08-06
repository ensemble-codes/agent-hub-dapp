export const CACHE_AGENT = "CACHE_AGENT";
export const CLEAR_CACHE = "CLEAR_CACHE";
export const REMOVE_STALE_ENTRIES = "REMOVE_STALE_ENTRIES";

export interface CacheAgent {
  type: typeof CACHE_AGENT;
  payload: {
    address: string;
    agent: any;
    timestamp: number;
  };
}

export interface ClearCache {
  type: typeof CLEAR_CACHE;
}

export interface RemoveStaleEntries {
  type: typeof REMOVE_STALE_ENTRIES;
  payload: {
    maxAge: number;
  };
}

export type AgentCacheAction = CacheAgent | ClearCache | RemoveStaleEntries;