"use client";

import { XmtpChat } from "@/components/chat/xmtp-chat";
import { WebsocketChat } from "@/components/chat/websocket-chat";
import { FC, Suspense, useMemo } from "react";
import { useParams } from "next/navigation";
import { Loader } from "@/components";
import { CHAT_DATA, ORCHESTRATOR_AGENT_ADDRESS } from "@/constants";
import { useAgent } from "@/hooks/useAgent";

const PageContent: FC = () => {
  const params = useParams();
  const agentAddress = params.address as string;

  const { agent, loading } = useAgent(agentAddress || ORCHESTRATOR_AGENT_ADDRESS);

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