import { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { useAgentCache } from "@/context/agent-cache";
import { CACHE_AGENT } from "@/context/agent-cache/actions";

const GET_AGENT = gql`
  query GetAgent($id: String!) {
    agent(id: $id) {
      agentUri
      id
      name
      owner
      reputation
      metadata {
        agentCategory
        attributes
        communicationType
        communicationURL
        description
        dexscreener
        github
        id
        imageUri
        instructions
        name
        openingGreeting
        prompts
        telegram
        twitter
        website
        communicationParams
      }
      proposals {
        id
        isRemoved
        price
        service
        tokenAddress
      }
      tasks {
        id
        prompt
        issuer
        proposalId
        rating
        result
        status
        taskId
      }
    }
  }
`;

interface UseAgentResult {
  agent: any | null;
  loading: boolean;
  error: any;
}

export const useAgent = (address?: string): UseAgentResult => {
  const [state, dispatch] = useAgentCache();
  const [cachedAgent, setCachedAgent] = useState<any | null>(null);
  const [shouldFetch, setShouldFetch] = useState(false);

  // Check cache first
  useEffect(() => {
    if (!address) {
      setCachedAgent(null);
      setShouldFetch(false);
      return;
    }

    const cached = state.cache.get(address.toLowerCase());
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    if (cached && (now - cached.timestamp) < maxAge) {
      // Use cached data
      setCachedAgent(cached.agent);
      setShouldFetch(false);
    } else {
      // Need to fetch fresh data
      setCachedAgent(null);
      setShouldFetch(true);
    }
  }, [address, state.cache]);

  // Fetch from GraphQL only if needed
  const { data, loading, error } = useQuery(GET_AGENT, {
    variables: { id: address || "" },
    skip: !shouldFetch || !address,
  });

  // Cache the result
  useEffect(() => {
    if (data?.agent && address) {
      dispatch({
        type: CACHE_AGENT,
        payload: {
          address,
          agent: data.agent,
          timestamp: Date.now(),
        },
      });
      setCachedAgent(data.agent);
      setShouldFetch(false);
    }
  }, [data, address, dispatch]);

  // Return cached data if available, otherwise return query result
  return {
    agent: cachedAgent || data?.agent || null,
    loading: shouldFetch ? loading : false,
    error: shouldFetch ? error : null,
  };
};