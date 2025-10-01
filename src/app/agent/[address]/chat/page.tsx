"use client";

import { XmtpChat } from "@/components/chat/xmtp-chat";
import { WebsocketChat } from "@/components/chat/websocket-chat";
import { FC, Suspense, useMemo, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ChatSkeleton } from "@/components/ui/chat-skeleton";
import axios from "axios";

const PageContent: FC = () => {
  const params = useParams();
  const agentAddress = params.address as string;

  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const getAgent = async () => {
    try {
      setLoading(true);
      const data = await axios.get(
        `https://intern-api-staging.ensemble.codes/api/v1/agents/${agentAddress}`
      );
      console.log(data.data);
      setAgent(data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (agentAddress) {
      getAgent();
    }
  }, [agentAddress]);


  if (loading) return <ChatSkeleton />;
  
  // Fallback to using agent metadata
  if (agent) {
    /* switch (communicationType) {
      case "websocket": */
        return (
          <WebsocketChat
            agentId={agent.agent_id}
            communicationURL={agent?.metadata?.communicationURL ?? ""}
            namespace={`/${agent.agent_id}`}
            elizaV1={false}
            agentAddress={agentAddress}
          />
        );
      /* case "xmtp":
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
    } */
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