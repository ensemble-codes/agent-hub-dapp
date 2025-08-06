export interface CachedAgent {
  agent: any;
  timestamp: number;
}

export interface AgentCacheState {
  cache: Map<string, CachedAgent>;
}

const initialState: AgentCacheState = {
  cache: new Map(),
};

export default initialState;