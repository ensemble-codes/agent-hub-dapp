"use client";

import { XmtpChat } from "@/components/chat/xmtp-chat";
import { WebsocketChat } from "@/components/chat/websocket-chat";
import { FC, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Loader } from "@/components";
import { ORCHESTRATOR_AGENT_ADDRESS } from "@/constants";
import { useAgent } from "@/hooks/useAgent";

const PageContent: FC = () => {
  const searchParams = useSearchParams();
  const agentAddress = searchParams.get("agent");

  const { agent, loading } = useAgent(agentAddress || ORCHESTRATOR_AGENT_ADDRESS);

  const communicationType = useMemo(
    () => agent?.metadata?.communicationType ?? "",
    [agent]
  );
  
  // Parse agentId from communicationParams
  const agentId = useMemo(() => {
    if (!agent?.metadata?.communicationParams) return null;
    try {
      const params = JSON.parse(agent.metadata.communicationParams);
      return params.agentId;
    } catch (e) {
      console.error("Failed to parse communicationParams:", e);
      return null;
    }
  }, [agent]);

  if (loading) return <Loader />;

  if (!agentAddress || !agent) {
    // Always use WebsocketChat for orchestrator
    if (!agentId) return <p>Failed to load agent data</p>;
    
    return (
      <WebsocketChat
        agent={{
          id: agentId,
          metadata: { communicationURL: agent?.metadata?.communicationURL ?? "" },
        }}
      />
    );
  } else {
    switch (communicationType) {
      case "websocket":
        if (!agentId) return <p>Failed to load agent data</p>;
        return (
          <WebsocketChat
            agent={{
              id: agentId,
              metadata: {
                communicationURL: agent?.metadata?.communicationURL ?? "",
              },
            }}
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
          />
        );
      default:
        return <p>Unknown chat type: {communicationType}</p>;
    }
  }
};

const Page: FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
};

export default Page;
