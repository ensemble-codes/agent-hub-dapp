import { AgentCacheAction, CACHE_AGENT, CLEAR_CACHE, REMOVE_STALE_ENTRIES } from "./actions";
import { AgentCacheState } from "./state";

const agentCacheReducer = (state: AgentCacheState, action: AgentCacheAction): AgentCacheState => {
  switch (action.type) {
    case CACHE_AGENT: {
      const { address, agent, timestamp } = action.payload;
      const newCache = new Map(state.cache);
      newCache.set(address.toLowerCase(), { agent, timestamp });
      return {
        ...state,
        cache: newCache,
      };
    }
    
    case CLEAR_CACHE: {
      return {
        ...state,
        cache: new Map(),
      };
    }
    
    case REMOVE_STALE_ENTRIES: {
      const { maxAge } = action.payload;
      const now = Date.now();
      const newCache = new Map(state.cache);
      
      for (const [address, cached] of newCache.entries()) {
        if (now - cached.timestamp > maxAge) {
          newCache.delete(address);
        }
      }
      
      return {
        ...state,
        cache: newCache,
      };
    }
    
    default:
      return state;
  }
};

export default agentCacheReducer;