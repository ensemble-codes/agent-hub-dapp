"use client";

import { XmtpChat } from "@/components/chat/xmtp-chat";
import { WebsocketChat } from "@/components/chat/websocket-chat";
import { FC, Suspense, useMemo } from "react";
import { useParams } from "next/navigation";
import { Loader } from "@/components";
import { CHAT_DATA, ORCHESTRATOR_AGENT_ADDRESS } from "@/constants";
import { gql, useQuery } from "@apollo/client";

const PageContent: FC = () => {
  const params = useParams();
  const agentAddress = params.address as string;

  const GET_AGENT = gql`
    query MyQuery {
  agent(id: "${agentAddress || ORCHESTRATOR_AGENT_ADDRESS}") {
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

  const { data, loading } = useQuery(GET_AGENT);

  const agent = useMemo(() => {
    if (data?.agent) {
      return data.agent;
    }

    return null;
  }, [data]);

  const communicationType = useMemo(
    () => agent?.metadata?.communicationType ?? "",
    [agent]
  );
  
  // Check CHAT_DATA with case-insensitive comparison
  const chatData = useMemo(() => {
    if (!agentAddress) return null;
    // Try exact match first
    if (CHAT_DATA[agentAddress]) return CHAT_DATA[agentAddress];
    // Try case-insensitive match
    const lowerAddress = agentAddress.toLowerCase();
    for (const [key, value] of Object.entries(CHAT_DATA)) {
      if (key.toLowerCase() === lowerAddress) {
        return value;
      }
    }
    return null;
  }, [agentAddress]);

  if (loading) return <Loader />;

  // Check if we have chat data for this agent
  if (chatData) {
    return (
      <WebsocketChat
        agent={{
          id: chatData.agentId,
          metadata: { communicationURL: chatData.communicationURL },
        }}
        agentAddress={agentAddress}
      />
    );
  }
  
  // Fallback to using agent metadata
  if (agent) {
    switch (communicationType) {
      case "websocket":
        return (
          <WebsocketChat
            agent={{
              id: JSON.parse(agent?.metadata?.communicationParams)?.agentId,
              metadata: {
                communicationURL: agent?.metadata?.communicationURL ?? "",
              },
            }}
            agentAddress={agentAddress}
          />
        );
      case "xmtp":
        return (
          <XmtpChat
            agent={{
              id: agent?.id ?? "",
              metadata: {
                imageUri: agent?.metadata?.imageUri ?? "",
                name: agent?.name ?? "",
                prompts: agent?.metadata?.prompts ?? []
              },
            }}
            agentAddress={agentAddress}
          />
        );
      default:
        return <p>Unknown chat type: {communicationType}</p>;
    }
  }
  
  return <p>No agent found</p>;
};

const Page: FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
};

export default Page;