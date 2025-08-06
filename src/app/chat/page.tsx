"use client";

import { XmtpChat } from "@/components/chat/xmtp-chat";
import { WebsocketChat } from "@/components/chat/websocket-chat";
import { FC, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Loader } from "@/components";
import { CHAT_DATA, ORCHESTRATOR_AGENT_ADDRESS } from "@/constants";
import { useAgent } from "@/hooks/useAgent";

const PageContent: FC = () => {
  const searchParams = useSearchParams();
  const agentAddress = searchParams.get("agent");

  const { agent, loading } = useAgent(agentAddress || ORCHESTRATOR_AGENT_ADDRESS);

  const communicationType = useMemo(
    () => agent?.metadata?.communicationType ?? "",
    [agent]
  );
  const chatData = useMemo(
    () => agentAddress && CHAT_DATA[agentAddress],
    [agentAddress]
  );

  if (loading) return <Loader />;

  if (!agentAddress) {
    // Always use WebsocketChat for orchestrator
    return (
      <WebsocketChat
        agent={{
          id: CHAT_DATA[ORCHESTRATOR_AGENT_ADDRESS].agentId,
          metadata: { communicationURL: agent?.metadata?.communicationURL ?? "" },
        }}
      />
    );
  }

  if (chatData && (agentAddress)) {
    return (
      <WebsocketChat
        agent={{
          id: CHAT_DATA[agentAddress].agentId,
          metadata: { communicationURL: chatData.communicationURL },
        }}
      />
    );
  } else {
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
