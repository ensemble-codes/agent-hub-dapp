"use client";
import { createContext, FC, useContext, useEffect, useReducer } from "react";
import { AgentCacheAction, REMOVE_STALE_ENTRIES } from "./actions";
import agentCacheReducer from "./reducer";
import initialState, { AgentCacheState } from "./state";

interface ContextProps {
  children: React.ReactNode;
}

export const AgentCacheContext = createContext<[AgentCacheState, React.Dispatch<AgentCacheAction>]>([
  initialState,
  () => {},
]);

export const AgentCacheProvider: FC<ContextProps> = ({ children }) => {
  const [state, dispatch] = useReducer(agentCacheReducer, initialState);

  // Clean up stale entries every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({
        type: REMOVE_STALE_ENTRIES,
        payload: { maxAge: 5 * 60 * 1000 }, // 5 minutes
      });
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AgentCacheContext.Provider value={[state, dispatch]}>
      {children}
    </AgentCacheContext.Provider>
  );
};

export const useAgentCache = () => {
  const context = useContext(AgentCacheContext);
  if (!context) {
    throw new Error("useAgentCache must be used within AgentCacheProvider");
  }
  return context;
};