"use client";

import { XmtpChat } from "@/components/chat/xmtp-chat";
import { WebsocketChat } from "@/components/chat/websocket-chat";
import { FC, Suspense, useMemo } from "react";
import { useParams } from "next/navigation";
import { ChatSkeleton } from "@/components/ui/chat-skeleton";
import { useAgent } from "@/hooks/useAgent";

const PageContent: FC = () => {
  const params = useParams();
  const agentAddress = params.address as string;

  const { agent, loading } = useAgent(agentAddress);

  const communicationType = useMemo(
    () => agent?.metadata?.communicationType ?? "",
    [agent]
  );


  const communicationParams = JSON.parse(agent?.metadata?.communicationParams || '{}')
  const { agentId, elizaV1 } = communicationParams || {};

  if (loading) return <ChatSkeleton />;
  
  // Fallback to using agent metadata
  if (agent) {
    switch (communicationType) {
      case "websocket":
        return (
          <WebsocketChat
            agentId={agentId}
            communicationURL={agent?.metadata?.communicationURL ?? ""}
            elizaV1={elizaV1 ?? false}
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